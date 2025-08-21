import { GOOGLE_USER_INFO_SCOPES } from "../../mcp/utils/google/userInfo.ts";

export const SCOPES = [
  ...GOOGLE_USER_INFO_SCOPES,
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
];

export const API_URL = "https://www.googleapis.com/drive/v3";
export const OAUTH_URL = "https://oauth2.googleapis.com/";
export const OAUTH_URL_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";

// Common API parameters
export const FIELDS = "fields";
export const PAGE_SIZE = "pageSize";
export const PAGE_TOKEN = "pageToken";
export const Q = "q";
export const ORDER_BY = "orderBy";
export const INCLUDE_ITEMS_FROM_ALL_DRIVES = "includeItemsFromAllDrives";
export const SUPPORTS_ALL_DRIVES = "supportsAllDrives";
export const SPACES = "spaces";
export const CORPORA = "corpora";

// File fields
export const ID = "id";
export const NAME = "name";
export const MIME_TYPE = "mimeType";
export const DESCRIPTION = "description";
export const STARRED = "starred";
export const TRASHED = "trashed";
export const PARENTS = "parents";
export const PROPERTIES = "properties";
export const APP_PROPERTIES = "appProperties";
export const CREATED_TIME = "createdTime";
export const MODIFIED_TIME = "modifiedTime";
export const SHARED = "shared";
export const OWNERS = "owners";
export const WEB_VIEW_LINK = "webViewLink";
export const WEB_CONTENT_LINK = "webContentLink";
export const SIZE = "size";
export const FILE_EXTENSION = "fileExtension";
export const COMMON_FIELDS = [ID, NAME, MIME_TYPE, WEB_VIEW_LINK].join(",");

// MIME Types
export const FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
export const DOCUMENT_MIME_TYPE = "application/vnd.google-apps.document";
export const SPREADSHEET_MIME_TYPE = "application/vnd.google-apps.spreadsheet";
export const PRESENTATION_MIME_TYPE =
  "application/vnd.google-apps.presentation";

// Default values
export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_FIELDS = [
  "nextPageToken",
  `files(${COMMON_FIELDS})`,
].join(",");

export const DEFAULT_FIELDS_SLIDES = COMMON_FIELDS;

// Default fields for individual file operations (GET /files/:fileId)
export const DEFAULT_FIELDS_FILE = COMMON_FIELDS;
export const DEFAULT_FIELDS_DOCS = COMMON_FIELDS;
export const DEFAULT_FIELDS_SHEETS = COMMON_FIELDS;

// Error messages
export const ERROR_FAILED_TO_LIST_FILES = "Failed to list files";
export const ERROR_FAILED_TO_GET_FILE = "Failed to get file";
export const ERROR_FAILED_TO_CREATE_FILE = "Failed to create file";
export const ERROR_FAILED_TO_UPDATE_FILE = "Failed to update file";
export const ERROR_FAILED_TO_DELETE_FILE = "Failed to delete file";
export const ERROR_FILE_NOT_FOUND = "File not found";
export const ERROR_INVALID_PARAMETERS = "Invalid parameters";
export const ERROR_MISSING_FILE_ID = "Missing file ID";
export const ERROR_MISSING_FILE_NAME = "Missing file name";
export const ERROR_MISSING_MIME_TYPE = "Missing MIME type";
