import { DriveFile, FileList } from "./types.ts";

export interface AuthClient {
  "POST /token": {
    searchParams: {
      grant_type: string;
      code?: string;
      refresh_token?: string;
      client_id: string;
      client_secret: string;
      redirect_uri?: string;
    };
    response: {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
      scope?: string;
    };
  };
}

export interface Client {
  "GET /files": {
    response: FileList;
    searchParams: {
      pageSize?: number;
      pageToken?: string;
      q?: string;
      orderBy?: string;
      fields?: string;
      includeItemsFromAllDrives?: boolean;
      spaces?: string;
      corpora?: string;
    };
  };
  "GET /files/:fileId": {
    response: DriveFile;
    searchParams: {
      fields?: string;
    };
  };
  "POST /files": {
    response: DriveFile;
    searchParams: {
      uploadType?: string;
      fields?: string;
    };
    body: {
      name?: string;
      mimeType?: string;
      description?: string;
      parents?: string[];
      properties?: Record<string, string>;
      appProperties?: Record<string, string>;
    };
  };
  "PATCH /files/:fileId": {
    response: DriveFile;
    searchParams: {
      fields?: string;
    };
    body: {
      name?: string;
      description?: string;
      starred?: boolean;
      trashed?: boolean;
      properties?: Record<string, string>;
      appProperties?: Record<string, string>;
    };
  };
  "DELETE /files/:fileId": {
    response: void;
  };
  "POST /files/:fileId/copy": {
    response: DriveFile;
    searchParams: {
      fields?: string;
    };
    body: {
      name?: string;
      parents?: string[];
    };
  };
  "GET /files/:fileId/download": {
    response: ArrayBuffer;
    searchParams: {
      alt?: "media";
      fields?: string;
    };
  };
}
