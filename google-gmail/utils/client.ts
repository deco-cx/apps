import { EmailMessage, EmailsResponse, Example } from "./types.ts";

export interface Client {
  "POST /v4/example": {
    response: Example;
    searchParams: {
      ranges: string[];
      majorDimension?: string;
      valueRenderOption?: string;
      dateTimeRenderOption?: string;
    };
    body: {
      properties: {
        title: string;
        locale?: string;
        autoRecalc?: string;
        timeZone?: string;
      };
      example?: {
        properties: {
          title: string;
        };
      }[];
    };
  };
  "GET /gmail/v1/users/:userId/messages": {
    response: EmailsResponse;
    searchParams: {
      q?: string;
      labelIds?: string;
      includeSpamTrash?: boolean;
      maxResults?: number;
      pageToken?: string;
    };
  };
  "GET /gmail/v1/users/:userId/messages/:id": {
    response: EmailMessage;
    searchParams: {
      format?: string;
      metadataHeaders?: string;
    };
  };
  "POST /gmail/v1/users/:userId/messages/send": {
    response: {
      id: string;
      threadId: string;
      labelIds: string[];
    };
    body: {
      raw: string;
      threadId?: string;
    };
  };
}
