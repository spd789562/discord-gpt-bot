import { AttachmentBuilder, TextChannel } from 'discord.js';
import {
  SlashCommand,
  SlashCommandExecute,
} from '@/components/CommandBuilders';

import {
  slashCommandOption,
  GPTCommands,
  GPTOptions,
} from '@/commandOptions/chatgpt';
import { ImageSize, GPTSetting } from '@/structures/chatgpt';
import { ChatMessage } from 'chatgpt';

const execute: SlashCommandExecute = async (client, interaction) => {
  await interaction.deferReply();
  if (!interaction.guildId) {
    interaction.editReply('only support this command in guild');
    return;
  }

  const text = interaction.options.getString(GPTOptions.Text) || '';
  const id = interaction.options.get(GPTOptions.Id)?.value as string;
  const size =
    interaction.options.getString(GPTOptions.Size) || ImageSize.Small;
  const setting = interaction.options.getString(GPTOptions.Setting);
  const personality =
    interaction.options.getString(GPTOptions.Personality) || '';
  const thumbnail = interaction.options.getString(GPTOptions.Thumbnail) || '';

  switch (interaction.options.getSubcommand()) {
    case GPTCommands.Talk:
    case GPTCommands.SearchTalk: {
      const baseMessage = `> ${text} \n`;
      let currentMessage = '';
      let _message: string | null = null;
      let _setting: GPTSetting | null = null;
      async function editWebhook(content: string) {
        if (_setting && _message) {
          await client.webhooks.edit(
            _message,
            interaction.channel as TextChannel,
            {
              content,
              username: _setting.name,
              avatarURL: _setting.thumbnail,
            }
          );
        }
      }
      async function onProgress(partialResponse: ChatMessage) {
        if (
          (partialResponse.text &&
            partialResponse.text.length > currentMessage.length + 10) ||
          currentMessage.length === 0
        ) {
          currentMessage = partialResponse.text;
          if (!_setting) {
            interaction.editReply({
              content: `${baseMessage}${partialResponse.text}`,
            });
          } else {
            if (_message) {
              await editWebhook(`${baseMessage}${partialResponse.text}`);
            }
          }
        }
      }
      let systemMessage = setting;
      if (!systemMessage) {
        const guildId = interaction.guildId;
        const data = await client.chatgpt.getSystemMessageById(
          guildId,
          personality || 'default'
        );
        if (data) {
          if (data.value.thumbnail) {
            interaction.deleteReply();
            _setting = data.value;
            const res = await client.webhooks.send(
              interaction.channel as TextChannel,
              {
                content: `${baseMessage}typing...`,
                username: data.value.name,
                avatarURL: data.value.thumbnail,
              }
            );
            _message = res.id;
          } else {
            await interaction.editReply({
              content: `${baseMessage}typing...`,
            });
          }
          systemMessage = (data.value as GPTSetting).message;
        } else {
          systemMessage = client.chatgpt.defaultSystemMessage;
        }
      }
      try {
        const res =
          interaction.options.getSubcommand() == GPTCommands.SearchTalk
            ? await client.chatgpt.getSearchResponse(
                text,
                onProgress,
                systemMessage || undefined
              )
            : await client.chatgpt.getResponse(
                text,
                onProgress,
                systemMessage || undefined
              );
        if (res && !_setting) {
          await interaction.editReply({
            content: `${baseMessage}${res}`,
          });
        } else if (res && _setting && (_message as unknown as string)) {
          await editWebhook(`${baseMessage}${res}`);
        }
        return;
      } catch (e) {
        console.log(e);
      }
      if (!currentMessage) {
        if (!_setting) {
          await interaction.editReply({
            content: `${baseMessage}Empty Response`,
          });
        } else if (!!(_message as unknown as string)) {
          await editWebhook(`${baseMessage}Empty Response`);
        }
      } else {
        if (!_setting) {
          await interaction.editReply({
            content: `${baseMessage}${currentMessage}...Can not get rest of response`,
          });
        } else if (_message as unknown as string) {
          await editWebhook(
            `${baseMessage}${currentMessage}...Can not get rest of response`
          );
        }
      }
      break;
    }
    case GPTCommands.Image: {
      try {
        const imageUrl = await client.chatgpt.getImage(text, size as ImageSize);
        if (imageUrl) {
          const attachment = new AttachmentBuilder(imageUrl, {
            name: 'image.png',
          });
          await interaction.editReply({
            content: `> ${text}`,
            files: [attachment],
          });
        } else {
          await interaction.editReply({
            content: `> ${text} \nCan't get image response`,
          });
        }
      } catch (e) {
        console.log(e);
        await interaction.editReply({
          content: `> ${text} \nCan't get image response or prompt not accepted`,
        });
      }
      break;
    }
    case GPTCommands.GetTalkSetting: {
      const guildId = interaction.guildId;
      const data = await client.chatgpt.getSystemMessageById(
        guildId,
        personality
      );
      const dbData = data?.value as GPTSetting;
      const systemMessage =
        dbData?.message || client.chatgpt.defaultSystemMessage;
      await interaction.editReply({
        content: `> Current ${
          personality ? `\`${personality}\`` : 'default'
        } Personality: ${systemMessage}`,
      });
      break;
    }
    case GPTCommands.SetTalkSetting: {
      const guildId = interaction.guildId;
      if (setting) {
        await client.chatgpt.updateSystemMessage(
          guildId,
          personality,
          setting,
          thumbnail
        );
        await interaction.editReply({
          content: `> Set${
            personality ? `\`${personality}\`` : 'default'
          }personality: ${setting}`,
        });
      } else {
        await interaction.editReply({
          content: `> Please enter personality and setting`,
        });
      }
      break;
    }
  }
};

const GPTCommand: SlashCommand = {
  data: slashCommandOption,
  run: execute,
};

export default GPTCommand;
