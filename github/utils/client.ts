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
  "GET /repos/:owner/:repo/pulls/:pull_number": {
    response: {
      url: string;
      id: number;
      node_id: string;
      html_url: string;
      diff_url: string;
      patch_url: string;
      issue_url: string;
      number: number;
      state: string;
      locked: boolean;
      title: string;
      user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        type: string;
        site_admin: boolean;
        [key: string]: unknown;
      };
      body: string;
      created_at: string;
      updated_at: string;
      closed_at: string | null;
      merged_at: string | null;
      merge_commit_sha: string | null;
      assignee: {
        login: string;
        id: number;
        [key: string]: unknown;
      } | null;
      assignees: Array<{
        login: string;
        id: number;
        [key: string]: unknown;
      }>;
      requested_reviewers: Array<{
        login: string;
        id: number;
        [key: string]: unknown;
      }>;
      requested_teams: Array<{
        id: number;
        name: string;
        slug: string;
        [key: string]: unknown;
      }>;
      labels: Array<{
        id: number;
        name: string;
        color: string;
        default: boolean;
        [key: string]: unknown;
      }>;
      milestone: {
        url: string;
        html_url: string;
        id: number;
        number: number;
        title: string;
        description: string;
        state: string;
        [key: string]: unknown;
      } | null;
      head: {
        label: string;
        ref: string;
        sha: string;
        user: {
          login: string;
          id: number;
          [key: string]: unknown;
        };
        repo: {
          id: number;
          name: string;
          full_name: string;
          [key: string]: unknown;
        };
      };
      base: {
        label: string;
        ref: string;
        sha: string;
        user: {
          login: string;
          id: number;
          [key: string]: unknown;
        };
        repo: {
          id: number;
          name: string;
          full_name: string;
          [key: string]: unknown;
        };
      };
      _links: {
        self: { href: string };
        html: { href: string };
        issue: { href: string };
        comments: { href: string };
        review_comments: { href: string };
        review_comment: { href: string };
        commits: { href: string };
        statuses: { href: string };
      };
      author_association: string;
      auto_merge: unknown;
      draft: boolean;
      merged: boolean;
      mergeable: boolean | null;
      rebaseable: boolean | null;
      mergeable_state: string;
      merged_by: {
        login: string;
        id: number;
        [key: string]: unknown;
      } | null;
      comments: number;
      review_comments: number;
      maintainer_can_modify: boolean;
      commits: number;
      additions: number;
      deletions: number;
      changed_files: number;
      [key: string]: unknown;
    };
    searchParams: {
      owner: string;
      repo: string;
      pull_number: number;
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
