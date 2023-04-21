import { ApplicationCommandOptionType, Locale } from 'discord.js';
import {
  CommandOption,
  CommandSubOption,
  buildSlashOption,
} from '@/commandOptions/helper';
import { ImageSize } from '@/structures/chatgpt';

export enum GPTCommands {
  Talk = 'talk',
  SearchTalk = 'searchtalk',
  Image = 'image',
  GetTalkSetting = 'gettalksetting',
  SetTalkSetting = 'settalksetting',
}

export enum GPTOptions {
  Text = 'text',
  Id = 'id',
  Size = 'size',
  Setting = 'setting',
  Personality = 'personality',
  Thumbnail = 'thumbnail',
}

export const talkOption: CommandSubOption = {
  name: GPTCommands.Talk,
  description: 'Get gpt asking response',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: GPTOptions.Text,
      type: ApplicationCommandOptionType.String,
      description: 'Text to ask or chat',
      i18nName: {
        [Locale.EnglishGB]: 'text',
        [Locale.ChineseTW]: '對話',
      },
      required: true,
    },
    {
      name: GPTOptions.Personality,
      type: ApplicationCommandOptionType.String,
      description: 'use talk personality',
      i18nName: {
        [Locale.EnglishGB]: 'personality',
        [Locale.ChineseTW]: '性格選擇',
      },
      required: false,
      autocomplete: true,
    },
    {
      name: GPTOptions.Setting,
      type: ApplicationCommandOptionType.String,
      description:
        'talk personality setting, only apply when not use personality',
      i18nName: {
        [Locale.EnglishGB]: 'setting',
        [Locale.ChineseTW]: '回覆性格',
      },
      required: false,
    },
  ],
};

export const searchTalkOption: CommandSubOption = {
  name: GPTCommands.SearchTalk,
  description: 'Get gpt asking response including google search function',
  type: ApplicationCommandOptionType.Subcommand,
  options: [...talkOption.options],
};

export const getTalkSettingOption: CommandSubOption = {
  name: GPTCommands.GetTalkSetting,
  description: 'Get talk personality',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: GPTOptions.Personality,
      type: ApplicationCommandOptionType.String,
      description: 'Personality name',
      i18nName: {
        [Locale.EnglishGB]: 'name',
        [Locale.ChineseTW]: '名稱',
      },
      required: false,
      autocomplete: true,
    },
  ],
};

export const setTalkSettingOption: CommandSubOption = {
  name: GPTCommands.SetTalkSetting,
  description: 'Setting or update talk personality',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: GPTOptions.Personality,
      type: ApplicationCommandOptionType.String,
      description: 'Personality name',
      i18nName: {
        [Locale.EnglishGB]: 'name',
        [Locale.ChineseTW]: '名稱',
      },
      required: true,
      autocomplete: true,
    },
    {
      name: GPTOptions.Setting,
      type: ApplicationCommandOptionType.String,
      description: 'Personality setting',
      i18nName: {
        [Locale.EnglishGB]: 'setting',
        [Locale.ChineseTW]: '回覆性格',
      },
      required: true,
    },
    {
      name: GPTOptions.Thumbnail,
      type: ApplicationCommandOptionType.String,
      description: 'Reply Thumbnail, default is none',
      i18nName: {
        [Locale.EnglishGB]: 'thumbnail',
        [Locale.ChineseTW]: '頭貼',
      },
      required: false,
    },
  ],
};

export const imageOption: CommandSubOption = {
  name: GPTCommands.Image,
  description: 'generate an image base on prompt',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: GPTOptions.Text,
      type: ApplicationCommandOptionType.String,
      description: 'the prompt for the image',
      i18nName: {
        [Locale.EnglishGB]: 'prompt',
        [Locale.ChineseTW]: '圖片描述',
      },
      required: true,
    },
    {
      name: GPTOptions.Size,
      type: ApplicationCommandOptionType.String,
      description:
        'Image Size, default is small(256x256) other sizes are medium(512x512) and big(1024x1024)',
      i18nName: {
        [Locale.EnglishGB]: 'size',
        [Locale.ChineseTW]: '圖片大小',
      },
      choices: [
        {
          name: 'small',
          name_localizations: {
            [Locale.EnglishGB]: 'small',
            [Locale.ChineseTW]: '小',
          },
          value: ImageSize.Small,
        },
        {
          name: 'medium',
          name_localizations: {
            [Locale.EnglishGB]: 'medium',
            [Locale.ChineseTW]: '中',
          },
          value: ImageSize.Medium,
        },
        {
          name: 'big',
          name_localizations: {
            [Locale.EnglishGB]: 'big',
            [Locale.ChineseTW]: '大',
          },
          value: ImageSize.Large,
        },
      ],
      required: false,
    },
  ],
};

export const commandOption: CommandOption = {
  name: 'gpt',
  description: 'openAI gpt api',
  options: [
    talkOption,
    searchTalkOption,
    getTalkSettingOption,
    setTalkSettingOption,
    imageOption,
  ],
};
export const slashCommandOption = buildSlashOption(commandOption);
