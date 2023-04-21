import { ClientEvents } from 'discord.js';
import type DiscordClient from '@/structures/DiscordClient';

export default class<K extends keyof ClientEvents> {
  constructor(
    public event: K,
    public listener: (client: DiscordClient, ...args: ClientEvents[K]) => any
  ) {}
}
