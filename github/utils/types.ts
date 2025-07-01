// notice that here we have the types for the return of the API calls
// you can use https://quicktype.io/ to convert JSON to typescript

export interface GithubUser {
  login: string;
  id: number;
  avatar_url: string;
}

// Tipos do OpenAPI do GitHub
export interface SimpleUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
  site_admin: boolean;
}

export interface Repository {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: SimpleUser;
  html_url: string;
  description?: string;
  fork: boolean;
  url: string;
}

export interface GistFile {
  filename: string;
  type: string;
  language: string | null;
  raw_url: string;
  size: number;
  content?: string;
}

export interface GistSimple {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Record<string, GistFile>;
  public: boolean;
  created_at: string;
  updated_at: string;
  description: string | null;
  comments: number;
  user: SimpleUser | null;
  owner: SimpleUser | null;
  truncated: boolean;
}

export interface OauthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export interface GithubIssueClean {
  number: number;
  state: "open" | "closed";
  title: string;
  body: string;
  url: string;
  labels: string[];
  user: string;
  created_at: string;
  closed_at?: string;
  comments: number;
  assignees: string[];
}

export interface GithubIssueLabel {
  id: number;
  name: string;
  [key: string]: unknown;
}

export interface GithubIssueAssignee {
  login: string;
  [key: string]: unknown;
}

export interface GithubIssueUser {
  login: string;
  [key: string]: unknown;
}

export interface GithubIssue {
  number: number;
  state: "open" | "closed";
  title: string;
  body: string;
  html_url: string;
  labels: (GithubIssueLabel | string)[];
  user: GithubIssueUser;
  created_at: string;
  closed_at?: string;
  comments: number;
  assignees: GithubIssueAssignee[];
  pull_request?: unknown;
  [key: string]: unknown;
}
