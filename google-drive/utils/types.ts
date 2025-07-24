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

export interface SearchFilesParams {
  query: string;
  pageSize?: number;
  pageToken?: string;
  fields?: string;
}
