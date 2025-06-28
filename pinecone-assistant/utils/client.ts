import {
  ChatContextRequest,
  ChatContextResponse,
  FileListResponse,
  FileUploadResponse,
  GetFileUploadResponse,
} from "./types.ts";

export interface PineconeAPI {
  "POST /assistant/chat/:assistant_name/context": {
    response: ChatContextResponse;
    searchParams?: {
      filter?: Record<string, unknown>;
    };
    body: ChatContextRequest;
  };

  "GET /assistant/files/:assistant_name": {
    response: FileListResponse;
    searchParams?: {
      filter?: string;
    };
  };

  "GET /assistant/files/:assistant_name/:assistant_file_id": {
    response: GetFileUploadResponse;
    searchParams?: {
      include_url?: boolean;
    };
  };

  "DELETE /assistant/files/:assistant_name/:assistant_file_id": {
    response: void;
  };

  "POST /assistant/files/:assistant_name": {
    response: FileUploadResponse;
    body: FormData;
    searchParams?: {
      metadata?: string;
    };
  };
}
