import { ChannelType } from 'discord.js';
import ClientEvent from '../components/ClientEvent';

import { getMathNode } from '@/commandOptions/math';

import Config from '@/config';

export default new ClientEvent('messageCreate', async (client, message) => {
  try {
    if (message.channel.type === ChannelType.DM) return;
    if (message.author.bot) return;

    const prefix = Config.Prefix;
    if (message.content.startsWith(Config.MathPrefix)) {
      const expression = message.content.slice(Config.MathPrefix.length).trim();
      // empty or duplicate prefix
      if (!expression || expression.startsWith(Config.MathPrefix)) return;
      const node = getMathNode(expression);
      if (node) {
        const evalResult = node.compile().evaluate();
        const result = evalResult.format
          ? evalResult.format({ notation: 'fixed' })
          : evalResult;
        return await message.reply({
          content: `> ${expression} = \`${result}\``,
        });
      } else {
        return await message.reply({
          content: 'Wrong math expression',
        });
      }
    }
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    // move out first paramter(command itself)
    const command = args.shift()?.toLowerCase() || '';

    const cmd = client.commands.find(
      (c) =>
        c.data.name === command ||
        (c.data.alias && c.data.alias.includes(command))
    );

    if (cmd) {
      // await message.channel.sendTyping();
      await cmd.run(client, message, args);
    } else {
      // await message.channel.sendTyping();
      // return await message.reply({
      //   content: `Command \`${command}\` does not exist`,
      // });
    }
  } catch (err) {
    console.log(err);
    // @ts-ignore
    await message.reply({ content: err.message });
  }
});
