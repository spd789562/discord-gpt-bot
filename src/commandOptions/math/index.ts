import { Locale, ApplicationCommandOptionType } from 'discord.js';
import { parse } from 'mathjs';
import { buildSlashOption, CommandOption } from '../helper';

export enum MathOptions {
  Expression = 'expression',
}

export const commandOption: CommandOption = {
  name: 'math',
  description: 'calculator',
  usage: '[expression]',
  options: [
    {
      name: MathOptions.Expression,
      type: ApplicationCommandOptionType.String,
      required: true,
      description: 'enter the expression, like 1+1',
      i18nName: {
        [Locale.EnglishGB]: 'Calc',
        [Locale.ChineseTW]: '算式',
      },
      autocomplete: true,
    },
  ],
};
export const slashCommandOption = buildSlashOption(commandOption);

export function getMathNode(text: string) {
  try {
    return parse(text);
  } catch (e) {
    return false;
  }
}
