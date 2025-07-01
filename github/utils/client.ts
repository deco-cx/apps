import { GithubUser } from "./types.ts";
import type {
  GistSimple,
  GithubIssue,
  OauthResponse,
  Repository,
  SimpleUser,
} from "./types.ts";

export interface Client {
  "GET /users/:username": {
    response: GithubUser;
  };
  "POST /users/:username": {
    response: GithubUser;
    body: {
      filter: string;
    };
  };
  "GET /user": {
    response: SimpleUser;
  };
  "GET /user/repos": {
    response: Repository[];
    searchParams?: {
      visibility?: "all" | "public" | "private";
      affiliation?: string;
      per_page?: number;
    };
  };
  "POST /gists": {
    response: GistSimple;
    body: {
      description?: string;
      public: boolean;
      files: Record<string, { content: string }>;
    };
  };
  "GET /gists/public": {
    response: GistSimple[];
    searchParams?: {
      since?: string;
    };
  };
  "GET /repos/:owner/:repo/contents/:path": {
    response: {
      name: string;
      path: string;
      sha: string;
      size: number;
      url: string;
      html_url: string;
      git_url: string;
      download_url: string;
      type: string;
      content: string;
      encoding: string;
    };
    searchParams: {
      owner: string;
      repo: string;
      path: string;
    };
  };
  "GET /repos/:owner/:repo/issues": {
    response: GithubIssue[];
    searchParams: {
      owner: string;
      repo: string;
      state?: "open" | "closed" | "all";
      per_page?: number;
      page?: number;
      labels?: string;
    };
  };
  "GET /repos/:owner/:repo/issues/:issue_number": {
    response: GithubIssue;
    searchParams: {
      owner: string;
      repo: string;
      issue_number: number;
    };
  };
  "POST /repos/:owner/:repo/issues": {
    response: GithubIssue;
    body: {
      title: string;
      body?: string;
      labels?: string[];
    };
    searchParams: {
      owner: string;
      repo: string;
    };
  };
  "POST /repos/:owner/:repo/issues/:issue_number/comments": {
    response: {
      id: number;
      html_url: string;
      body: string;
      user: { login: string };
      created_at: string;
      [key: string]: unknown;
    };
    body: {
      body: string;
    };
    searchParams: {
      owner: string;
      repo: string;
      issue_number: number;
    };
  };
}

export interface ClientOauth {
  "POST /login/oauth/access_token": {
    response: OauthResponse;
    searchParams: {
      client_id: string;
      client_secret: string;
      code: string;
      redirect_uri: string;
    };
  };
}
