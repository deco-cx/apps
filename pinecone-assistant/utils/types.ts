export interface ChatContextRequest {
  query: string;
  filter?: Record<string, unknown>;
}

export interface FileUploadRequest {
  form: FormData;
}

type FileStatus =
  | "Processing"
  | "Available"
  | "Deleting"
  | "ProcessingFailed"
  | "Deleted";
export interface FileUploadResponse {
  name: string;
  id: string;
  metadata: Record<string, unknown> | null;
  created_on: string;
  updated_on: string;
  status: FileStatus;
  percent_done: number | null;
  signed_url: string | null;
  error_message: string | null;
}

export interface GetFileUploadResponse {
  name: string;
  id: string;
  metadata: Record<string, unknown> | null;
  created_on: string;
  updated_on: string;
  status: FileStatus;
  percent_done: number | null;
  signed_url: string | null;
  error_message: string | null;
}

export interface FileListResponse {
  files: FileReference[];
}

export interface FileReference {
  status: FileStatus;
  id: string;
  name: string;
  metadata: null | Record<string, unknown>;
  updated_on: string;
  created_on: string;
  percent_done: number;
  signed_url: string;
  error_message: null | string;
}

export interface Reference {
  type: "file";
  file: FileReference;
  pages: number[];
}

export interface Snippet {
  type: "file";
  content: string;
  score: number;
  reference: Reference;
}

export interface ChatContextResponse {
  snippets: Snippet[];
}
