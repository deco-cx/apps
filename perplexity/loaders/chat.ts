import { AppContext } from "../mod.ts";
import { ChatCompletion, Message } from "../client.ts";

export interface Props {
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
   * @title Messages
   * @description The conversation messages to send to the API
   */
  messages: Message[];

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
 * @title Chat Completions
 * @description Generate responses from Perplexity AI models
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ChatCompletion> => {
  const {
    model = ctx.defaultModel,
    messages,
    max_tokens,
    temperature = 0.2,
    top_p = 0.9,
    search_domain_filter,
    return_images = false,
    return_related_questions = false,
    search_recency_filter,
    search_context_size = "high",
  } = props;

  const response = await ctx.api["POST /chat/completions"](
    {},
    {
      body: {
        model,
        messages,
        max_tokens,
        temperature,
        top_p,
        search_domain_filter,
        return_images,
        return_related_questions,
        search_recency_filter,
        web_search_options: search_context_size
          ? {
            search_context_size,
          }
          : undefined,
      },
    },
  );

  const result = await response.json();
  return result;
};

export default loader;
