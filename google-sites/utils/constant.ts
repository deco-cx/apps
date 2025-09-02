import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";
export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/cloud_search.query",
];

export const API_URL = "https://www.googleapis.com";
export const CLOUD_SEARCH_API_URL = "https://cloudsearch.googleapis.com";
export const OAUTH_URL = "https://oauth2.googleapis.com";
export const OAUTH_URL_AUTH = `https://accounts.google.com/o/oauth2/v2/auth`;

export const ERROR_MESSAGES = {
  SITE_NOT_FOUND: "Google Site not found",
  PERMISSION_DENIED: "Permission denied to access Google Site",
  INVALID_SITE_ID: "Invalid Google Site ID",
  QUOTA_EXCEEDED: "API quota exceeded",
  NETWORK_ERROR: "Network error occurred",
  UNAUTHORIZED: "Authentication required",
  HTML_PARSE_ERROR: "Failed to parse HTML content",
} as const;
