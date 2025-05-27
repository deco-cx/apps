// Types for Perplexity API requests and responses

// Model options
export type PerplexityModel =
  | "sonar"
  | "sonar-pro"
  | "sonar-deep-research"
  | "sonar-reasoning-pro"
  | "sonar-reasoning";

// Message roles
export type MessageRole = "system" | "user" | "assistant";

// Message structure
export interface Message {
  role: MessageRole;
  content: string;
}

// Web search options
export interface WebSearchOptions {
  search_context_size?: "low" | "medium" | "high" | "maximum";
}

// Response format options
export interface ResponseFormat {
  type?: "json_object";
  schema?: Record<string, unknown>;
}

// Chat completion response
export interface ChatCompletion {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: Array<{
    index: number;
    message: Message;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Client interface for Perplexity API
export interface PerplexityClient {
  "POST /chat/completions": {
    response: ChatCompletion;
    body: {
      model: string;
      messages: Message[];
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
      search_domain_filter?: string[];
      return_images?: boolean;
      return_related_questions?: boolean;
      search_recency_filter?: string;
      top_k?: number;
      stream?: boolean;
      presence_penalty?: number;
      frequency_penalty?: number;
      response_format?: ResponseFormat;
      web_search_options?: WebSearchOptions;
    };
  };
}
