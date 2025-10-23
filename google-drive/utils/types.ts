export interface DriveFile {
  id?: string;
  name?: string;
  mimeType?: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  parents?: string[];
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
  createdTime?: string;
  modifiedTime?: string;
  shared?: boolean;
  owners?: User[];
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
  fileExtension?: string;
}

export interface User {
  displayName?: string;
  emailAddress?: string;
  kind?: string;
  me?: boolean;
  permissionId?: string;
  photoLink?: string;
}

export interface FileList {
  kind?: string;
  nextPageToken?: string;
  incompleteSearch?: boolean;
  files?: DriveFile[];
}

export interface ListFilesParams {
  pageSize?: number;
  pageToken?: string;
  q?: string;
  orderBy?: string;
  fields?: string;
  includeItemsFromAllDrives?: boolean;
  spaces?: string;
  corpora?: string;
}

export interface GetFileParams {
  fileId: string;
  fields?: string;
}

export interface CreateFileParams {
  name: string;
  mimeType?: string;
  description?: string;
  parents?: string[];
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
}

export interface UpdateFileParams {
  fileId: string;
  name?: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  properties?: Record<string, string>;
  appProperties?: Record<string, string>;
}

export interface DeleteFileParams {
  fileId: string;
}

export interface CopyFileParams {
  fileId: string;
  name?: string;
  parents?: string[];
}

/**
 * Query term (field) to filter by
 */
export type QueryTerm =
  | "name" // File name
  | "fullText" // Full text search in content
  | "mimeType" // MIME type of the file
  | "modifiedTime" // Last modified date
  | "createdTime" // Creation date
  | "viewedByMeTime" // Last viewed date
  | "sharedWithMeTime" // Date shared with me
  | "trashed" // Whether in trash
  | "starred" // Whether starred
  | "parents" // Parent folder IDs
  | "owners" // File owners
  | "writers" // Users with write access
  | "readers" // Users with read access
  | "sharedWithMe" // Files shared with me
  | "properties" // Custom properties
  | "appProperties" // App-specific properties
  | "visibility" // File visibility
  | "orgUnitId"; // Organization unit

/**
 * Query operator for comparisons
 */
export type QueryOperator =
  | "=" // Exact match
  | "!=" // Not equal
  | "<" // Less than (dates, numbers)
  | "<=" // Less than or equal
  | ">" // Greater than (dates, numbers)
  | ">=" // Greater than or equal
  | "contains" // String contains
  | "in" // Value in collection
  | "has"; // Has property (for properties/appProperties)

/**
 * Logical combinator for joining conditions
 */
export type QueryCombinator = "and" | "or";

/**
 * A single query condition
 */
export interface QueryCondition {
  /**
   * The field to filter by (e.g., 'name', 'mimeType', 'trashed')
   */
  term: QueryTerm;

  /**
   * The comparison operator (e.g., '=', 'contains', '>', 'in')
   */
  operator: QueryOperator;

  /**
   * The value to compare against.
   * - For strings: use quotes in the value if needed (e.g., 'hello')
   * - For dates: ISO 8601 format (e.g., '2024-01-01T12:00:00')
   * - For booleans: 'true' or 'false'
   * - For 'in' operator: the collection item (e.g., 'me', 'user@example.com')
   * - For 'has' operator (properties): object like "{ key='dept' and value='sales' }"
   */
  value: string;

  /**
   * How to combine with the next condition.
   * - 'and': Both conditions must be true
   * - 'or': Either condition must be true
   *
   * Omit for the last condition in the array.
   */
  combinator?: QueryCombinator;

  /**
   * If true, negates this condition with 'not'.
   * @default false
   */
  negate?: boolean;
}

export interface SearchFilesParams {
  /**
   * Array of query conditions to filter files.
   * Each condition specifies a term, operator, value, and optional combinator.
   *
   * Examples:
   * ```typescript
   * // Search for non-trashed image files
   * queries: [
   *   { term: "trashed", operator: "=", value: "false", combinator: "and" },
   *   { term: "mimeType", operator: "contains", value: "image/" }
   * ]
   *
   * // Search for files named "hello" or "goodbye"
   * queries: [
   *   { term: "name", operator: "=", value: "hello", combinator: "or" },
   *   { term: "name", operator: "=", value: "goodbye" }
   * ]
   *
   * // Search for Google Docs I own
   * queries: [
   *   { term: "mimeType", operator: "=", value: "application/vnd.google-apps.document", combinator: "and" },
   *   { term: "owners", operator: "in", value: "me" }
   * ]
   *
   * // Search in specific folder
   * queries: [
   *   { term: "parents", operator: "in", value: "FOLDER_ID_HERE" }
   * ]
   *
   * // Files modified after date
   * queries: [
   *   { term: "modifiedTime", operator: ">", value: "2024-01-01T12:00:00" }
   * ]
   * ```
   *
   * @see https://developers.google.com/drive/api/guides/search-files
   */
  queries: QueryCondition[];

  /**
   * Maximum number of files to return per page (1-1000).
   * @default 100
   */
  pageSize?: number;

  /**
   * Token for retrieving the next page of results.
   */
  pageToken?: string;

  /**
   * Selector specifying which fields to include in the response.
   * @default "nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink)"
   */
  fields?: string;

  /**
   * Comma-separated list of spaces to query within.
   * Supported values: 'drive', 'appDataFolder', 'photos'
   * @default "drive"
   */
  spaces?: string;

  /**
   * Bodies of items (files/documents) to which the query applies.
   * Supported values: 'user', 'domain', 'drive', 'allDrives'
   * @default "user"
   */
  corpora?: string;

  /**
   * Sort order for the returned files.
   * Examples: 'createdTime', 'folder', 'modifiedByMeTime', 'modifiedTime',
   * 'name', 'quotaBytesUsed', 'recency', 'sharedWithMeTime', 'starred', 'viewedByMeTime'
   * Add 'desc' suffix for descending order: 'modifiedTime desc'
   */
  orderBy?: string;

  /**
   * Whether to include items from all drives (Team Drives) in results.
   * @default false
   */
  includeItemsFromAllDrives?: boolean;
}
