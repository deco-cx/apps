import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/presentations",
  "https://www.googleapis.com/auth/presentations.readonly",
  "https://www.googleapis.com/auth/drive.file",
];

export const API_URL = "https://slides.googleapis.com/v1";
export const OAUTH_URL = "https://oauth2.googleapis.com/";
export const OAUTH_URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";

// Common API parameters
export const FIELDS = "fields";
export const PAGE_SIZE = "pageSize";
export const PAGE_TOKEN = "pageToken";

// Presentation fields
export const ID = "presentationId";
export const TITLE = "title";
export const SLIDES = "slides";
export const MASTERS = "masters";
export const LAYOUTS = "layouts";
export const LOCALE = "locale";
export const REVISION_ID = "revisionId";

// Default values
export const DEFAULT_PAGE_SIZE = 100;

// Error messages
export const ERROR_FAILED_TO_LIST_PRESENTATIONS =
  "Failed to list presentations";
export const ERROR_FAILED_TO_GET_PRESENTATION = "Failed to get presentation";
export const ERROR_FAILED_TO_CREATE_PRESENTATION =
  "Failed to create presentation";
export const ERROR_FAILED_TO_UPDATE_PRESENTATION =
  "Failed to update presentation";
export const ERROR_FAILED_TO_DELETE_PRESENTATION =
  "Failed to delete presentation";
export const ERROR_PRESENTATION_NOT_FOUND = "Presentation not found";
export const ERROR_INVALID_PARAMETERS = "Invalid parameters";
export const ERROR_MISSING_PRESENTATION_ID = "Missing presentation ID";
export const ERROR_MISSING_PRESENTATION_TITLE = "Missing presentation title";
