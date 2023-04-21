import {
  TextChannel,
  AnyThreadChannel,
  VoiceChannel,
  Collection,
  Webhook,
  WebhookMessageCreateOptions,
} from 'discord.js';
import type DiscordClient from './DiscordClient';

export type AllowWebhookChannel = TextChannel | AnyThreadChannel | VoiceChannel;

class WebhookManager {
  shareWebhookName = 'Bot Webhook';
  constructor(private client: DiscordClient) {}
  async getByChannel(channel: AllowWebhookChannel) {
    const webhooks =
      channel.isThread() && channel.parent
        ? await channel.parent?.fetchWebhooks()
        : await (channel as TextChannel).fetchWebhooks();
    const webhook = (webhooks || new Collection()).find(
      (webhook: Webhook) => webhook.name === this.shareWebhookName
    );
    return webhook;
  }
  async createForChannel(channel: AllowWebhookChannel) {
    const webhookOption = {
      name: this.shareWebhookName,
      avatar: this.client.user?.displayAvatarURL(),
      reason: 'character usage',
    };
    const webhook = channel.isThread()
      ? await channel.parent?.createWebhook(webhookOption)
      : await channel.createWebhook(webhookOption);

    if (!webhook) throw new Error('webhook create failed');

    return webhook;
  }
  async forceGetByChannel(channel: AllowWebhookChannel) {
    const webhook = await this.getByChannel(channel);
    if (webhook) return webhook;
    /* force create one if not exist */
    return await this.createForChannel(channel);
  }

  async send(
    channel: AllowWebhookChannel,
    content: WebhookMessageCreateOptions
  ) {
    const webhook = await this.forceGetByChannel(channel);
    const threadId = channel.isThread() ? channel.id : undefined;
    return await webhook.send({
      ...content,
      threadId,
    });
  }

  async edit(
    messageId: string,
    channel: AllowWebhookChannel,
    content: WebhookMessageCreateOptions
  ) {
    const webhook = await this.forceGetByChannel(channel);
    const threadId = channel.isThread() ? channel.id : undefined;
    return await webhook.editMessage(messageId, {
      ...content,
      threadId,
    });
  }
}

export default WebhookManager;
