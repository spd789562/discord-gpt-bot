import {
  ApplicationCommandOptionType,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  APIApplicationCommandOptionChoice,
  ApplicationCommandOptionChoiceData,
  SlashCommandBooleanOption,
  SlashCommandStringOption,
  SlashCommandIntegerOption,
  LocaleString,
  CommandInteraction,
} from 'discord.js';

export interface OptionBase {
  name: string;
  description: string;
  i18nName?: Partial<Record<LocaleString, string>>;
  usage?: string;
  alias?: string[];
  options?: CommandSubOption[];
}

export interface CommandSubOption extends OptionBase {
  type: ApplicationCommandOptionType;
  required?: boolean;
  autocomplete?: boolean;
  choices?: APIApplicationCommandOptionChoice[];
}

export interface CommandOption extends OptionBase {}

export async function replyInteractionAndDelete(
  interaction: CommandInteraction
) {
  try {
    await interaction.deferReply();
    await interaction.deleteReply();
  } catch (e) {
    console.log(e);
  }
}

function sharedOptionHandler<
  T extends
    | SlashCommandBuilder
    | SlashCommandBooleanOption
    | SlashCommandStringOption
    | SlashCommandIntegerOption
    | SlashCommandSubcommandBuilder
    | SlashCommandSubcommandGroupBuilder
>(builder: T, optionData: OptionBase): T {
  builder.setName(optionData.name).setDescription(optionData.description);
  if (optionData.i18nName) {
    builder.setNameLocalizations(optionData.i18nName);
  }
  return builder;
}

function normalOptionHandler<
  T extends SlashCommandStringOption | SlashCommandIntegerOption
>(builder: T, optionData: CommandSubOption): T {
  sharedOptionHandler(builder, optionData);
  if (optionData.required) {
    builder.setRequired(true);
  }
  if (optionData.choices) {
    if (optionData.type === ApplicationCommandOptionType.String) {
      (builder as SlashCommandStringOption).addChoices(
        ...(optionData.choices as APIApplicationCommandOptionChoice<string>[])
      );
    } else if (optionData.type === ApplicationCommandOptionType.Integer) {
      (builder as SlashCommandIntegerOption).addChoices(
        ...(optionData.choices as APIApplicationCommandOptionChoice<number>[])
      );
    }
  }
  if (optionData.autocomplete) {
    builder.setAutocomplete(true);
  }
  if (optionData.i18nName) {
    builder.setNameLocalizations(optionData.i18nName);
  }

  return builder;
}

function subcommandHandler(
  builder: SlashCommandSubcommandBuilder,
  optionData: CommandSubOption
): SlashCommandSubcommandBuilder {
  sharedOptionHandler(builder, optionData);

  if (optionData.options) {
    for (const opt of optionData.options) {
      switch (opt.type) {
        case ApplicationCommandOptionType.String:
          builder.addStringOption((optionBuilder) =>
            normalOptionHandler(optionBuilder, opt)
          );
          break;
        case ApplicationCommandOptionType.Integer:
          builder.addIntegerOption((optionBuilder) =>
            normalOptionHandler(optionBuilder, opt)
          );
          break;
        default:
          break;
      }
    }
  }

  return builder;
}

export function buildSlashOption(option: CommandOption): SlashCommandBuilder {
  const command = sharedOptionHandler(new SlashCommandBuilder(), option);

  if (option.options) {
    for (const opt of option.options) {
      switch (opt.type) {
        case ApplicationCommandOptionType.String:
          command.addStringOption((builder) =>
            normalOptionHandler(builder, opt)
          );
          break;
        case ApplicationCommandOptionType.Integer:
          command.addIntegerOption((builder) =>
            normalOptionHandler(builder, opt)
          );
          break;
        case ApplicationCommandOptionType.Boolean:
          command.addBooleanOption((builder) =>
            sharedOptionHandler(builder, opt)
          );
          break;
        case ApplicationCommandOptionType.Subcommand:
          command.addSubcommand((builder) => subcommandHandler(builder, opt));
          break;
        case ApplicationCommandOptionType.SubcommandGroup:
          command.addSubcommandGroup((builder) => {
            sharedOptionHandler(builder, opt);
            if (opt.options) {
              for (const sub of opt.options) {
                builder.addSubcommand((subBuilder) =>
                  subcommandHandler(subBuilder, sub)
                );
              }
            }
            return builder;
          });
          break;
        case ApplicationCommandOptionType.Boolean:
        default:
          break;
      }
    }
  }

  return command;
}
