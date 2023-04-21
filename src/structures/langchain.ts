import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  SystemMessagePromptTemplate,
} from 'langchain/prompts';
import { ZeroShotAgent, AgentExecutor } from 'langchain/agents';
import { CallbackManager } from 'langchain/callbacks';

import { GoogleSerpAPI } from './plugins/googleSerpAPI';

import { prop } from 'ramda';

import Config from '@/config';

type onProgress = (arg: { text: string }) => void;

class LangChainChatGPTAPI {
  private modal = 'gpt-4';

  tools = [new GoogleSerpAPI()];

  constructor() {}

  async sendMessage(
    input: string,
    systemMessage: string,
    onProgress: onProgress
  ) {
    const executor = await this.createExecutor(systemMessage, onProgress);

    console.log('create executor success');

    try {
      const result = await executor.run(input);
      return {
        text: result,
      };
    } catch (e) {
      /* sometime ending will not include certain key, but response is ok, just force return that */
      if (
        e instanceof Error &&
        e.message.startsWith('Unable to parse JSON response from chat agent.')
      ) {
        return {
          text: e.message
            .split('Unable to parse JSON response from chat agent.')[1]
            .trim(),
        };
      }
      if (
        e instanceof Error &&
        e.message.startsWith('Could not parse LLM output:')
      ) {
        return {
          text: e.message.split('Could not parse LLM output:')[1].trim(),
        };
      }

      return {
        text: 'Error',
      };
    }
  }

  async createExecutor(systemMessage: string, onProgress: onProgress) {
    const llmChain = new LLMChain({
      prompt: this.createChatPrompt(systemMessage),
      llm: this.createModel(onProgress),
    });

    const agent = new ZeroShotAgent({
      llmChain,
      allowedTools: this.tools.map(prop('name')),
    });

    return AgentExecutor.fromAgentAndTools({ agent, tools: this.tools });
  }

  createChatPrompt(systemMessage: string) {
    const prompt = ZeroShotAgent.createPrompt(this.tools, {
      prefix: `${systemMessage}, You have access to the following tools:`,
      suffix: `remember your personality, only useing tools while needed. always use the exact characters \`Final Answer\` when responding.`,
    });
    const chatPrompt = ChatPromptTemplate.fromPromptMessages([
      new SystemMessagePromptTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate(`{input}
      
      This was your previous work (but I haven't seen any of it! I only see what you return as "Final Answer:"):
      {agent_scratchpad}`),
    ]);
    return chatPrompt;
  }

  createModel(onProgress: onProgress) {
    let _text = '';
    const callbackManager = CallbackManager.fromHandlers({
      async handleLLMNewToken(token: string, verbose: boolean) {
        _text += token;
        if (_text.includes('Final Answer: ')) {
          const text = _text.split('Final Answer: ')[1];
          onProgress({ text });
          return;
        }
        /* when not using any agent tools it will not using "Thought:" starts */
        if (_text.length > 3 && !_text.includes('Thought:')) {
          onProgress({ text: _text });
        }
      },
    });

    return new ChatOpenAI({
      temperature: 0.8,
      openAIApiKey: Config.OpenAIKey,
      modelName: this.modal,
      callbackManager,
      streaming: true,
    });
  }

  get currentDate() {
    return new Date().toISOString().split('T')[0];
  }
}

export { LangChainChatGPTAPI };
