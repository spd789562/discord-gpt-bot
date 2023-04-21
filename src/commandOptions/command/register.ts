import { Routes } from 'discord.js';
import { CommandOption } from '@/commandOptions/helper';

import type DiscordClient from '@/structures/DiscordClient';

export async function registerSlash(client: DiscordClient, guildId: string) {
  const slashCommands = client.slashs.map((command) => command.data.toJSON());
  const contextMenuCommands = client.ctxs.map((command) =>
    command.data.toJSON()
  );
  const commands = [...slashCommands, ...contextMenuCommands];
  console.info(`Registering ${commands.length} commands`);
  await client.rest.put(
    Routes.applicationGuildCommands(client.user!.id, guildId),
    { body: commands }
  );
}

export async function unRegisterSlash(client: DiscordClient, guildId: string) {
  const guild = await client.guilds.fetch(guildId);
  const guildCommands = await guild.commands.fetch();
  const ownCommands = guildCommands.filter(
    (command) => command.applicationId === client.user!.id
  );
  console.error(
    `Unregistering own commands, one by one, total ${ownCommands.size} commands`
  );
  for await (const command of ownCommands.values()) {
    await command.delete();
  }
}

export const registerCommandOption: CommandOption = {
  name: 'register',
  description: 'register commands',
};

export const unRegisterCommandOption: CommandOption = {
  name: 'unregister',
  description: 'remove commands',
};
