import { MessageCommand } from '@/components/CommandBuilders';

import {
  registerCommandOption,
  registerSlash,
} from '@/commandOptions/command/register';

export default {
  data: registerCommandOption,
  async run(client, message) {
    if (!message.guildId) {
      return;
    }
    try {
      await registerSlash(client, message.guildId);
    } catch (error: any) {
      console.error(error?.message);
      return message.channel.send({ content: 'Slash command register fail' });
    }

    return message.channel.send({ content: 'Slash command register success' });
  },
} as MessageCommand;
