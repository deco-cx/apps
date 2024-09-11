export type Provider = "Anthropic" | "Openai";

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
}
/**@title Prompt: {{{agentName}}} */
export interface Prompt {
  agentName: string;
  provider: Provider;
  /**
   * @format textarea
   * @title Prompt content
   * @description ex: "Please do xyz" To be used in calling via code
   */
  prompt: string;

  advanced?: PromptDetails;
}
