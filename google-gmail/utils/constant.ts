import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

export const API_URL = "https://gmail.googleapis.com";
export const OAUTH_URL = "https://oauth2.googleapis.com";
export const OAUTH_URL_AUTH = `https://accounts.google.com/o/oauth2/v2/auth`;
