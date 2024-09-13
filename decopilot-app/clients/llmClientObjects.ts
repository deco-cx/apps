import { LLMClient, LLMResponseType, Provider } from "../types.ts";

import _OpenAIApp, {
  Props as _OpenAIProps,
  State as _OpenAIState,
} from "../../openai/mod.ts";

import _AnthropicApp, {
  Props as _AnthropicProps,
  State as _AnthropicState,
} from "../../anthropic/mod.ts";
import { App } from "deco/mod.ts";

export class AnthropicClient implements LLMClient {
  // private client: LLMClient;
  public provider: Provider;
  client: App;

  constructor(provider: Provider, client: App) {
    // this.client = client;
    this.provider = provider;
    this.client = client;
  }

  // const providerName = "Anthropic"
  call(prompt: string): LLMResponseType {
    console.log(`Calling Anthropic with prompt: ${prompt}`);
    const response: LLMResponseType = {
      id: "lol",
      created: 0,
      provider: this.provider, // Provider is OpenAI
      model: "Claude",
      llm_response: [{
        message: {
          role: "lol",
          content: `Pedro didn't write this yet, the prompt was ${prompt}`,
        },
        index: 0,
      }],
    };
    return response;
    // logica pra chamar a anthropic
  }
}

export class OpenAIClient implements LLMClient {
  public provider: Provider;
  client: App;

  constructor(provider: Provider, client: App) {
    // this.client = client;
    this.provider = provider;
    this.client = client;
  }

  call(prompt: string): LLMResponseType {
    console.log(`Calling OpenAI with prompt: ${prompt}`);
    const response: LLMResponseType = {
      id: "lol",
      created: 0,
      provider: "Anthropic", // Provider is OpenAI
      model: "chatGPT",
      llm_response: [{
        message: {
          role: "lol",
          content: `Pedro didn't write this yet, the prompt was ${prompt}`,
        },
        index: 0,
      }],
    };
    return response;
    // logica pra chamar a openai
  }
}
