import { Client, Collection } from 'discord.js';
import * as path from 'node:path';
import * as fs from 'node:fs';
import WebhookManager from './webhookManager';
import Autocomplete from './autocomplete';
import ChatGPT from './chatgpt';

import type ClientEvent from '@/components/ClientEvent';
import type {
  SlashCommand,
  ContextMenuCommand,
  MessageCommand,
} from '@/components/CommandBuilders';

import Config from '@/config';

const EventsDir = path.join(__dirname, '..', 'events');
const _CommandDir = path.join(__dirname, '..', 'commands');
const SlashCommandDir = path.join(_CommandDir, 'slash');
const CommandDir = path.join(_CommandDir, 'cmd');
const ContextMenuCommandDir = path.join(_CommandDir, 'ctx');

class DiscordClient extends Client {
  public commands: Collection<string, MessageCommand> = new Collection();
  public slashs: Collection<string, SlashCommand> = new Collection();
  public ctxs: Collection<string, ContextMenuCommand> = new Collection();
  public webhooks: WebhookManager;
  public autocomplete: Autocomplete;
  public chatgpt: ChatGPT;
  public config = Config;
  private activeTimer: NodeJS.Timeout | null = null;

  public constructor(...options: ConstructorParameters<typeof Client>) {
    super(...options);
    this.webhooks = new WebhookManager(this);
    this.chatgpt = new ChatGPT(this);
    this.autocomplete = new Autocomplete(this);

    this.init();
  }

  init() {
    this.loadDiscordEvent();
    this.loadSlashCommands();
    this.loadContextMenuCommands();
    this.loadCommands();
  }

  loadFiles<FileDefaultExport>(dir: string): FileDefaultExport[] {
    let files: FileDefaultExport[] = [];
    if (!fs.existsSync(dir)) return files;
    fs.readdirSync(dir).forEach((folder) => {
      const subfolder = path.join(dir, folder);
      const isFolder = fs.lstatSync(subfolder).isDirectory();
      /* if not folder just add that */
      if (!isFolder) {
        const command = require(subfolder).default as FileDefaultExport;
        files.push(command);
        return;
      }
      // only read two levels folder, so not using recursive
      fs.readdirSync(subfolder).forEach((file) => {
        const subfolder = path.join(dir, file);
        const isFolder = fs.lstatSync(subfolder).isDirectory();
        if (isFolder) return;
        const command = require(subfolder)
          .default as FileDefaultExport;
        files.push(command);
      });
    });
    return files;
  }
  loadDiscordEvent() {
    const events = this.loadFiles<ClientEvent<any>>(EventsDir);
    events.forEach((event) => {
      this.on(event.event, (...args) => {
        event.listener(this, ...args);
      });
    });
  }
  loadSlashCommands() {
    const slashs = this.loadFiles<SlashCommand>(SlashCommandDir);
    slashs.forEach((slash) => {
      this.slashs.set(slash.data.name, slash);
    });
  }
  loadCommands() {
    const commands = this.loadFiles<MessageCommand>(CommandDir);
    commands.forEach((command) => {
      this.commands.set(command.data.name, command);
    });
  }
  loadContextMenuCommands() {
    const ctxs = this.loadFiles<ContextMenuCommand>(ContextMenuCommandDir);
    ctxs.forEach((ctx) => {
      this.ctxs.set(ctx.data.name, ctx);
    });
  }
  consistentSetActivity = () => {
    if (this.activeTimer) {
      clearInterval(this.activeTimer);
    }
    this.activeTimer = setInterval(() => {
      this.user?.setActivity(this.config.initActivity);
    }, 1000 * 60 * 5); // 5 minutes
  };
}

export default DiscordClient;
