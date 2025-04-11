import { AppContext } from "../mod.ts";
import { ChatCompletion } from "../client.ts";
import chatLoader, { Props as ChatProps } from "./chat.ts";

export interface Props {
  /**
   * @title Prompt
   * @description The text prompt to send to the model
   */
  prompt: string;

  /**
   * @title Model
   * @description The model to use (defaults to app's default model)
   */
  model?:
    | "sonar"
    | "sonar-pro"
    | "sonar-deep-research"
    | "sonar-reasoning-pro"
    | "sonar-reasoning";

  /**
   * @title Maximum Tokens
   * @description Maximum number of tokens in the response
   */
  max_tokens?: number;

  /**
   * @title Temperature
   * @description Controls the randomness of the response (0-2)
   * @default 0.2
   */
  temperature?: number;

  /**
   * @title Top P
   * @description Controls response diversity via nucleus sampling (0-1)
   * @default 0.9
   */
  top_p?: number;

  /**
   * @title Search Domain Filters
   * @description Domains to limit search results to (up to 3)
   */
  search_domain_filter?: string[];

  /**
   * @title Return Images
   * @description Whether to include images in search results
   * @default false
   */
  return_images?: boolean;

  /**
   * @title Return Related Questions
   * @description Whether to return related questions
   * @default false
   */
  return_related_questions?: boolean;

  /**
   * @title Search Recency Filter
   * @description Filter search results based on time (e.g., 'week', 'day')
   */
  search_recency_filter?: string;

  /**
   * @title Web Search Context Size
   * @description Amount of web search context to include
   * @default "high"
   */
  search_context_size?: "low" | "medium" | "high" | "maximum";
}

/**
 * @title Ask Perplexity
 * @description Generate responses from Perplexity AI models using a single prompt
 */
const loader = (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ChatCompletion> => {
  const { prompt, ...otherProps } = props;

  // Create a messages array with a single user message
  const chatProps: ChatProps = {
    ...otherProps,
    messages: [{ role: "user", content: prompt }],
  };

  // Call the chat loader with the transformed props
  return chatLoader(chatProps, req, ctx);
};

export default loader;
