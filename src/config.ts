import { config } from 'dotenv';
import { ActivityType } from 'discord.js';

config();

export default {
  DefaultPrefix: process.env.Prefix || '>', //Default prefix, Server Admins can change the prefix
  Prefix: process.env.Prefix || '>', //Default prefix, Server Admins can change the prefix
  MathPrefix: process.env.MathPrefix || '%',
  Token: process.env.Token || '', //Discord Bot Token
  initActivity: {
    name: 'chat gpt', // The message shown
    type: ActivityType.Playing,
  },

  OpenAIKey: process.env.OpenAIKey || '',
} as const;
