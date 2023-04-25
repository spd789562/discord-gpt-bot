import { InteractionType } from 'discord.js';
import ClientEvent from '@/components/ClientEvent';

export default new ClientEvent(
  'interactionCreate',
  async (client, interaction) => {
    /* handle slash command */
    if (interaction.isChatInputCommand()) {
      const command = client.slashs.get(interaction.commandName);
      try {
        if (!command || !command.run) {
          return await interaction.reply({
            content: 'Command does not exist or removed',
            ephemeral: true,
          });
        }
        return await command.run(client, interaction);
      } catch (err) {
        console.error('interaction encounter error');
        console.error(err);
        if (!(interaction.deferred || interaction.replied)) {
          return await interaction.reply({
            content: 'Command encounter error',
            ephemeral: true,
          });
        } else {
          return await interaction.followUp({
            content: 'Command encounter error',
            ephemeral: true,
          });
        }
      }
    /* handle context menu command */
    } else if (interaction.isContextMenuCommand()) {
      const command = client.ctxs.get(interaction.commandName);
      try {
        if (command && command.run) {
          await command.run(client, interaction);
        } else {
          throw new Error('Command does not exist or removed');
        }
      } catch (err) {
        console.error('context menu encounter error');
        console.error(err);
        if (!(interaction.deferred || interaction.replied)) {
          return await interaction.reply({
            content: 'Command encounter error',
            ephemeral: true,
          });
        } else {
          return await interaction.followUp({
            content: 'Command encounter error',
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      // button interaction
      
    } else if (interaction.isAutocomplete()) {
      try {
        await client.autocomplete.handle(interaction);
      } catch (e) {
        console.error('autocomplete encounter error');
        console.error((e as any)?.message);
      }
      return;
    } else if (interaction.type === InteractionType.ModalSubmit) {
      // modal submit
    }
  }
);
