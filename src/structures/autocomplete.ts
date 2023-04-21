import {
  AutocompleteInteraction,
  ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { MathOptions, getMathNode } from '@/commandOptions/math';
import { GPTOptions } from '@/commandOptions/chatgpt';
import type DiscordClient from './DiscordClient';

class Autocomplete {
  availables = ['math', 'gpt'];
  constructor(private client: DiscordClient) {}
  async handle(interaction: AutocompleteInteraction) {
    const mainName = interaction.commandName;
    if (this.availables.includes(mainName)) {
      const options = interaction.options;
      if (mainName === 'math') {
        await this.mathHandler(interaction, options);
      } else if (mainName === 'gpt') {
        await this.gptHandler(interaction, options);
      } else {
        return await interaction.respond([]);
      }
    } else {
      return await interaction.respond([]);
    }
  }
  async mathHandler(
    interaction: AutocompleteInteraction,
    options: AutocompleteInteraction['options']
  ) {
    const focusedOption = options.getFocused(true);
    if (
      focusedOption &&
      (focusedOption.name as MathOptions) === MathOptions.Expression
    ) {
      const currentValues = focusedOption.value;
      const mathNode = getMathNode(currentValues);
      if (mathNode && mathNode.evaluate()) {
        const result = mathNode.evaluate();
        return await interaction.respond([
          {
            name: `${currentValues}=${
              result.format ? result.format({ notation: 'fixed' }) : result
            }`,
            value: `${currentValues}`,
          },
        ]);
      } else {
        return await interaction.respond([]);
      }
    } else {
      return await interaction.respond([]);
    }
  }
  async gptHandler(
    interaction: AutocompleteInteraction,
    options: AutocompleteInteraction['options']
  ) {
    const focusedOption = options.getFocused(true);
    if (
      focusedOption &&
      (focusedOption.name as GPTOptions) === GPTOptions.Personality
    ) {
      const currentValues = focusedOption.value;
      const guildId = interaction.guildId;
      const settings = guildId
        ? await this.client.chatgpt.getSystemMessages(guildId)
        : [];
      if (settings && settings.length) {
        const choices = settings
          .map((setting) => ({
            name: (setting.value as any).name,
            value: (setting.value as any).name,
          }))
          .filter((choice) => choice.name !== 'default');
        return await interaction.respond(
          currentValues
            ? choices.filter((choice) => choice.name.includes(currentValues))
            : choices
        );
      } else {
        return await interaction.respond([]);
      }
    } else {
      return await interaction.respond([]);
    }
  }
}

export default Autocomplete;
