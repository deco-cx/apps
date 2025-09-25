import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/drive.file",
];

export const API_URL = "https://docs.googleapis.com";
export const OAUTH_URL = "https://oauth2.googleapis.com";
export const OAUTH_URL_AUTH = `https://accounts.google.com/o/oauth2/v2/auth`;

export const EXPORT_FORMATS = {
  TEXT: "text/plain",
  HTML: "text/html",
  ODT: "application/vnd.oasis.opendocument.text",
  PDF: "application/pdf",
  RTF: "application/rtf",
  EPUB: "application/epub+zip",
} as const;

export const PERMISSION_ROLES = {
  OWNER: "owner",
  WRITER: "writer",
  COMMENTER: "commenter",
  READER: "reader",
} as const;

export const PERMISSION_TYPES = {
  USER: "user",
  GROUP: "group",
  DOMAIN: "domain",
  ANYONE: "anyone",
} as const;

export const ERROR_MESSAGES = {
  DOCUMENT_NOT_FOUND: "Document not found",
  PERMISSION_DENIED: "Permission denied",
  INVALID_DOCUMENT_ID: "Invalid document ID",
  QUOTA_EXCEEDED: "API quota exceeded",
  NETWORK_ERROR: "Network error occurred",
  UNAUTHORIZED: "Authentication required",
} as const;
