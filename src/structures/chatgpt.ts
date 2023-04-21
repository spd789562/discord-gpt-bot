import type { ChatGPTAPI, ChatMessage } from 'chatgpt';
import { Configuration, OpenAIApi } from 'openai';
import Store from './storage';

import DiscordClient from './DiscordClient';

import Config from '@/config';
import { LangChainChatGPTAPI } from './langchain';

export interface GPTSetting {
  name: string;
  message: string;
  thumbnail?: string;
}

export enum ImageSize {
  Small = '256x256',
  Medium = '512x512',
  Large = '1024x1024',
}
type ChatGPTOnProgress = (message: ChatMessage) => void;

const configuration = new Configuration({
  apiKey: Config.OpenAIKey,
});

const defaultSystemMessage =
  'You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible with corresponding language.';

class ChatGPT {
  private api?: ChatGPTAPI = undefined;
  private searchGptApi: LangChainChatGPTAPI = new LangChainChatGPTAPI();
  private openai: OpenAIApi = new OpenAIApi(configuration);
  private modal = 'gpt-4';
  private _systemMessage = defaultSystemMessage;
  public store: Store<GPTSetting> = new Store<GPTSetting>();
  public readonly defaultSystemMessage = defaultSystemMessage;
  constructor(private client: DiscordClient) {
    this.prepareModule();
  }

  async prepareModule() {
    const { ChatGPTAPI } = await import('chatgpt');
    try {
      this.api = new ChatGPTAPI({
        apiKey: Config.OpenAIKey,
        completionParams: {
          model: this.modal,
        },
      });

      console.log('gpt init success');
    } catch (e) {
      console.error('gpt init error');
      console.error(e);
    }
  }

  async getResponse(
    message: string,
    onProgress: ChatGPTOnProgress,
    systemMessage?: string
  ) {
    if (!this.api) return;
    return (
      await this.api.sendMessage(message, {
        systemMessage: this.getFullSystemMessage(systemMessage),
        onProgress,
      })
    ).text;
  }
  async getSearchResponse(
    message: string,
    onProgress: ChatGPTOnProgress,
    systemMessage?: string
  ) {
    if (!this.api) return;
    return (
      await this.searchGptApi.sendMessage(
        message.replace('test:', ''),
        this.getFullSystemMessage(systemMessage),
        onProgress as any
      )
    ).text;
  }

  async getImage(message: string, size: ImageSize = ImageSize.Small) {
    const res = await this.openai.createImage({
      prompt: message,
      n: 1,
      size,
    });
    return res.data.data[0].url;
  }

  async getSystemMessages(id: string) {
    return await this.store.findMany({ key: `${id}` });
  }

  async getSystemMessageById(id: string, name: string = '') {
    const meta = await this.store.findOne({
      key: `${id}`,
      'value.name': name,
    });
    return meta;
  }

  async updateSystemMessage(
    id: string,
    name: string = 'default',
    message: string = '',
    thumbnail?: string
  ) {
    const meta = await this.getSystemMessageById(id, name);
    if (meta) {
      if (message) {
        meta.value.message = message;
      }
      if (thumbnail) {
        meta.value.thumbnail = thumbnail;
      }
      await this.store.updateOne({ _id: meta._id }, { value: meta.value });
    } else {
      await this.store.create({
        key: `${id}`,
        value: {
          name,
          message: message || this._systemMessage,
          thumbnail,
        },
      });
    }
  }
  getFullSystemMessage(message: string = '') {
    return `${message}\nKnowledge cutoff: 2021-09-01\nCurrent date: ${this.currentDate}`;
  }
  get currentDate() {
    return new Date().toISOString().split('T')[0];
  }
  get currentSystemMessage() {
    return this._systemMessage;
  }
}

export default ChatGPT;
