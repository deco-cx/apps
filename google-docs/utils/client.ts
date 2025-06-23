import {
  BatchUpdateDocumentRequest,
  BatchUpdateDocumentResponse,
  CreateDocumentRequest,
  CreateDocumentResponse,
  Document,
  DocumentsListResponse,
} from "./types.ts";

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
  "GET /v1/documents": {
    response: DocumentsListResponse;
    searchParams: {
      pageSize?: number;
      pageToken?: string;
      q?: string;
      orderBy?: string;
    };
  };
  "GET /v1/documents/:documentId": {
    response: Document;
    searchParams?: {
      includeTabsContent?: boolean;
      suggestionsViewMode?: string;
    };
  };
  "POST /v1/documents": {
    response: CreateDocumentResponse;
    body: CreateDocumentRequest;
  };
  "POST /v1/documents/:documentId:batchUpdate": {
    response: BatchUpdateDocumentResponse;
    body: BatchUpdateDocumentRequest;
  };
  "POST /v1/documents/:sourceDocumentId:copy": {
    response: CreateDocumentResponse;
    body: {
      title?: string;
      destinationFolderId?: string;
    };
  };
  "DELETE /v1/documents/:documentId": {
    response: Record<PropertyKey, never>;
    searchParams?: Record<PropertyKey, never>;
  };
  "POST /v1/documents/:documentId/permissions": {
    response: {
      id: string;
    };
    body: {
      role: string;
      type: string;
      emailAddress?: string;
      domain?: string;
      sendNotificationEmail?: boolean;
      message?: string;
    };
  };
  "GET /v1/documents/:documentId/permissions": {
    response: {
      permissions: Array<{
        id: string;
        type: string;
        emailAddress?: string;
        domain?: string;
        role: string;
        displayName?: string;
        photoLink?: string;
        deleted?: boolean;
        pendingOwner?: boolean;
      }>;
    };
    searchParams?: Record<PropertyKey, never>;
  };
  "DELETE /v1/documents/:documentId/permissions/:permissionId": {
    response: Record<PropertyKey, never>;
    searchParams?: Record<PropertyKey, never>;
  };
}
