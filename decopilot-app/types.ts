import { App } from "deco/mod.ts";
import { Secret } from "../website/loaders/secret.ts";

export type Provider = "Anthropic" | "Openai";

/**@title {{{llmProvider}}} API Key */
export interface Credentials {
  llmProvider: Provider;
  key: Secret;
}

export interface LLMClient {
  provider?: Provider;
  client?: App;
  call: (prompt: string) => LLMResponseType; //Add tool calling parameters, differents models (Available tools?)
}

export type Text = string;
export type Image = string;

export type Attachment = Text | Image;

export interface PromptDetails {
  /**
   * @format textarea
   * @title Context
   * @description Context for query
   */
  context?: string;

  /**
   * @format textarea
   * @title Examples
   * @description Useful examples for defining expected output. Refer to prompting guide for more details
   */
  examples?: string;

  /**
   * @format textarea
   * @title Restrictions
   * @description Restrictions for query ex: "only output code, not text"
   */
  restrictions?: string;

  /**
   * @description Group of available functions to run on this prompt
   * @example deco-sites/admin/actions/studio/draw.ts
   */
  functions?: string[];
}

/**@title Prompt {{{agentName}}} */
export interface Prompt {
  name: string;
  provider: Provider;
  model: string;
  /**
   * @format textarea
   * @title Prompt content
   * @description ex: "Please do xyz" To be used in calling via code
   */
  prompt: string;

  advanced?: PromptDetails;
}

export type LLMResponseType = {
  id: string;
  created?: number;
  provider: Provider;
  model: string;
  stop_reason?: string;
  llm_response: Array<{
    message: {
      role: string;
      content: string | null;
    };
    index: number;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};
