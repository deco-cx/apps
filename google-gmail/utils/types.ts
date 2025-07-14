export interface Example {
  example: {
    properties: {
      title: string;
    };
  }[];
}

export interface GmailPayload {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: Array<{
    name: string;
    value: string;
  }>;
  body?: {
    attachmentId?: string;
    size: number;
    data?: string;
  };
  parts?: GmailPayload[];
}

export interface EmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  historyId?: string;
  internalDate?: string;
  payload?: GmailPayload;
  sizeEstimate?: number;

  // Campos extraídos dos headers
  subject?: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  date?: string;
  messageId?: string;
  replyTo?: string;

  // Corpo do email decodificado
  body?: {
    text?: string;
    html?: string;
  };

  // Headers completos
  headers?: Array<{
    name: string;
    value: string;
  }>;
}

export interface EmailsResponse {
  messages: EmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate: number;
}
