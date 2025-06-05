export interface SearchQuery {
  inputs?: {
    text: string;
  };
  vector?: {
    values: number[];
  };
  id?: string;
  top_k: number;
}

export interface RerankConfig {
  query?: string;
  model: string;
  top_n: number;
  rank_fields: string[];
}

export interface SearchRequest {
  query: SearchQuery;
  fields: string[];
  rerank?: RerankConfig;
}

export interface SearchHit {
  _id: string;
  _score: number;
  fields: Record<string, string>;
}

export interface SearchUsage {
  embed_total_tokens: number;
  read_units: number;
  rerank_units: number;
}

export interface SearchResponse {
  result: {
    hits: SearchHit[];
  };
  usage: SearchUsage;
}

export interface ChatContextRequest {
  query: string;
}

export interface FileReference {
  status: string;
  id: string;
  name: string;
  size: number;
  metadata: null | Record<string, unknown>;
  updated_on: string;
  created_on: string;
  percent_done: number;
  signed_url: string;
  error_message: null | string;
}

export interface Reference {
  type: string;
  file: FileReference;
  pages: number[];
}

export interface Snippet {
  type: string;
  content: string;
  score: number;
  reference: Reference;
}

export interface ChatContextResponse {
  snippets: Snippet[];
}
