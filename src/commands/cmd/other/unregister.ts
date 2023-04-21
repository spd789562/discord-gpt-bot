import { MessageCommand } from '@/components/CommandBuilders';

import {
  unRegisterCommandOption,
  unRegisterSlash,
} from '@/commandOptions/command/register';

export default {
  data: unRegisterCommandOption,
  async run(client, message) {
    if (!message.guildId) {
      return;
    }
    try {
      await unRegisterSlash(client, message.guildId);
    } catch (error) {
      return message.channel.send({ content: 'Unregister command failed' });
    }

    return message.channel.send({ content: 'Unregister command success' });
  },
} as MessageCommand;
