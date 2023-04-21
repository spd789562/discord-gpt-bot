import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  ContextMenuCommandInteraction,
  ContextMenuCommandBuilder,
  Message,
} from 'discord.js';
import type { CommandOption } from '@/commandOptions/helper';
import type DiscordClient from '@/structures/DiscordClient';

export type SlashCommandExecute = (
  client: DiscordClient,
  interaction: ChatInputCommandInteraction
) => Promise<any>;
export interface SlashCommand {
  data: SlashCommandBuilder;
  run: SlashCommandExecute;
}

export type ContextMenuCommandExecute = (
  client: DiscordClient,
  interaction: ContextMenuCommandInteraction
) => Promise<any>;
export interface ContextMenuCommand {
  data: ContextMenuCommandBuilder;
  run: ContextMenuCommandExecute;
}

export type MessageCommandExecute = (
  client: DiscordClient,
  message: Message,
  args: string[]
) => Promise<any>;
export interface MessageCommandData extends CommandOption {}
export interface MessageCommand {
  data: CommandOption;
  run: MessageCommandExecute;
}
