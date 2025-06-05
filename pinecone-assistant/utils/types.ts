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
