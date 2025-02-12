import { App } from "@deco/deco";
import { Secret } from "../website/loaders/secret.ts";

export type Provider = "Anthropic" | "OpenAI"; // | "HugginFace" | "Ollama";

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

export type AttachmentExtension =
  | ".csv"
  | ".jpeg"
  | ".png"
  | ".json";

export interface TextOnly {
  /**
   * @default TextOnly
   * @hide True
   */
  type: "TextOnly";
  call_text: string;
}
export interface FileURL {
  /**
   * @default URL
   * @hide True
   */
  type: "URL";
  call_text?: string;
  fileUrl: string;
  fileType: AttachmentExtension;
}
/**@title Attachment */
export type Attachment = TextOnly | FileURL;

export type Model =
  | "claude-3-5-sonnet-20240620"
  | "claude-3-opus-20240229"
  | "claude-3-sonnet-20240229"
  | "claude-3-haiku-20240307"
  | "gpt-4o"
  | "gpt-4"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo";

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
  /**
   * @description Optional list of available functions (actions or loaders) that the AI Assistant can perform.
   */
  availableFunctions?: string[];
}

/**@title Prompt: {{{name}}} */
export interface Prompt {
  name: string;
  /**
   * @description Brief description of Prompt output
   * @example Prompt lists out the meaning of life
   */
  description?: string;
  provider: Provider;
  model: Model; //fazer Dynamic Options
  /**
   * @format textarea
   * @title Prompt content
   * @description ex: "Please do xyz" To be used in calling via code
   */
  prompt: string;
  /**
   * @title Advanced Prompt Settings
   * @description Extra parameters to regulate prompt behaviour
   */
  advanced?: PromptDetails;
}

export type LLMResponseType = {
  id: string;
  created?: number;
  provider: Provider;
  model: string;
  tools: string[];
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

//Simple Chains are made exclusively of Prompts, while Complex can contain Agents
export type ChainType = "Simple" | "Complex";

export type LLMAgent = {
  name: string;
  path: string;
};

/**@title Prompt: {{{blockNames}}} */
export interface ComponentArray {
  /**
   * @format dynamic-options
   * @options decopilot-app/loaders/listAvailablePrompts.ts
   */
  blockNames: string;
  blockType: BlockType;
}

export type BlockType = "Prompt" | "Agent";

/**@title Chain: {{{name}}} */
export interface Chain {
  name: string;
  /**
   * @title Chain components
   * @description Prompts or Agents to be called in Chain
   */
  chainType: ChainType;
  /**
   * @description Brief description of Chain output
   * @example Chain lists out the meaning of life
   */
  description?: string;
  /**
   * @title Chain components
   * @description Prompts or Agents to be called in Chain
   */
  blockNames: ComponentArray[];
}

export type LLMChainResponseType = {
  id: string;
  created?: number;
  provider: Provider[];
  model: string[];
  stop_reason?: string;
  stopping_point?: ComponentArray;
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
