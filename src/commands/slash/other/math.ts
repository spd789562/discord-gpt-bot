import { SlashCommand } from '@/components/CommandBuilders';

import { MathOptions, slashCommandOption } from '@/commandOptions/math';
import { replyInteractionAndDelete } from '@/commandOptions/helper';

const MathCommand = {
  data: slashCommandOption,
  run: async (client, interaction) => {
    await replyInteractionAndDelete(interaction);
  },
} as SlashCommand;

export default MathCommand;
