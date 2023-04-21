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
    // this.loadContextMenuCommands();
    this.loadCommands();
  }

  loadDiscordEvent() {
    fs.readdirSync(EventsDir).forEach((file) => {
      const event = require(path.join(EventsDir, file))
        .default as ClientEvent<any>;
      this.on(event.event, (...args) => {
        event.listener(this, ...args);
      });
    });
  }
  loadSlashCommands() {
    fs.readdirSync(SlashCommandDir).forEach((folder) => {
      const subfolder = path.join(SlashCommandDir, folder);
      fs.readdirSync(subfolder).forEach((file) => {
        const isFolder = fs.lstatSync(path.join(subfolder, file)).isDirectory();
        if (isFolder) return;
        const command = require(path.join(subfolder, file))
          .default as SlashCommand;
        this.slashs.set(command.data.name, command);
      });
    });
  }
  loadCommands() {
    fs.readdirSync(CommandDir).forEach((folder) => {
      const subfolder = path.join(CommandDir, folder);
      fs.readdirSync(subfolder).forEach((file) => {
        const isFolder = fs.lstatSync(path.join(subfolder, file)).isDirectory();
        if (isFolder) return;
        const command = require(path.join(subfolder, file))
          .default as MessageCommand;
        this.commands.set(command.data.name, command);
      });
    });
  }
  loadContextMenuCommands() {
    fs.readdirSync(ContextMenuCommandDir).forEach((file) => {
      const isFolder = fs
        .lstatSync(path.join(ContextMenuCommandDir, file))
        .isDirectory();
      if (isFolder) return;
      const command = require(path.join(ContextMenuCommandDir, file))
        .default as ContextMenuCommand;
      this.ctxs.set(command.data.name, command);
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
