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
  // Added endpoints to support maintenance agent loaders
  "GET /orgs/:org/repos": {
    response: import("./types.ts").Repository[];
    searchParams: {
      org: string;
      type?:
        | "all"
        | "public"
        | "private"
        | "forks"
        | "sources"
        | "member"
        | "internal";
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo": {
    response: import("./types.ts").Repository & {
      default_branch?: string;
      archived?: boolean;
      open_issues_count?: number;
      subscribers_count?: number;
      stargazers_count?: number;
      forks_count?: number;
      created_at?: string;
      updated_at?: string;
      pushed_at?: string;
      language?: string | null;
      size?: number;
      topics?: string[];
      license?: { key: string; name: string } | null;
    };
    searchParams: { owner: string; repo: string };
  };
  "GET /repos/:owner/:repo/traffic/views": {
    response: {
      count: number;
      uniques: number;
      views: Array<{ timestamp: string; count: number; uniques: number }>;
    };
    searchParams: { owner: string; repo: string; per?: number };
  };
  "GET /repos/:owner/:repo/traffic/clones": {
    response: {
      count: number;
      uniques: number;
      clones: Array<{ timestamp: string; count: number; uniques: number }>;
    };
    searchParams: { owner: string; repo: string; per?: number };
  };
  "GET /repos/:owner/:repo/traffic/popular/referrers": {
    response: Array<{ referrer: string; count: number; uniques: number }>;
    searchParams: { owner: string; repo: string };
  };
  "GET /repos/:owner/:repo/traffic/popular/paths": {
    response: Array<
      { path: string; title: string; count: number; uniques: number }
    >;
    searchParams: { owner: string; repo: string };
  };
  "GET /repos/:owner/:repo/commits": {
    response: Array<{
      sha: string;
      html_url?: string;
      commit: {
        author?: { name?: string; email?: string; date?: string };
        committer?: { name?: string; email?: string; date?: string };
        message: string;
      };
      author?: { login?: string } | null;
      committer?: { login?: string } | null;
    }>;
    searchParams: {
      owner: string;
      repo: string;
      sha?: string;
      path?: string;
      author?: string;
      since?: string;
      until?: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/pulls": {
    response: Array<{
      id: number;
      number: number;
      state: string;
      title: string;
      user?: { login: string };
      created_at: string;
      updated_at: string;
      closed_at: string | null;
      merged_at: string | null;
    }>;
    searchParams: {
      owner: string;
      repo: string;
      state?: "open" | "closed" | "all";
      head?: string;
      base?: string;
      sort?: "created" | "updated" | "popularity" | "long-running";
      direction?: "asc" | "desc";
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/collaborators": {
    response: Array<
      import("./types.ts").SimpleUser & {
        permissions?: Record<string, boolean>;
        role_name?: string;
      }
    >;
    searchParams: {
      owner: string;
      repo: string;
      affiliation?: "outside" | "direct" | "all";
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/teams": {
    response: Array<{ id: number; name: string; slug: string }>;
    searchParams: {
      owner: string;
      repo: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /orgs/:org/teams": {
    response: Array<{ id: number; name: string; slug: string }>;
    searchParams: { org: string; per_page?: number; page?: number };
  };
  "GET /orgs/:org/teams/:team_slug/members": {
    response: Array<import("./types.ts").SimpleUser>;
    searchParams: {
      org: string;
      team_slug: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /orgs/:org/members": {
    response: Array<import("./types.ts").SimpleUser>;
    searchParams: { org: string; per_page?: number; page?: number };
  };
  "GET /orgs/:org/outside_collaborators": {
    response: Array<import("./types.ts").SimpleUser>;
    searchParams: { org: string; per_page?: number; page?: number };
  };
  "GET /repos/:owner/:repo/actions/workflows": {
    response: {
      total_count: number;
      workflows: Array<Record<string, unknown>>;
    };
    searchParams: {
      owner: string;
      repo: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/actions/runs": {
    response: {
      total_count: number;
      workflow_runs: Array<Record<string, unknown>>;
    };
    searchParams: {
      owner: string;
      repo: string;
      per_page?: number;
      page?: number;
      status?: string;
      event?: string;
      created?: string;
      branch?: string;
    };
  };
  "GET /repos/:owner/:repo/contributors": {
    response: Array<{ login: string; id: number; contributions: number }>;
    searchParams: {
      owner: string;
      repo: string;
      anon?: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/branches/:branch/protection": {
    response: Record<string, unknown> & {
      required_status_checks?: Record<string, unknown> | null;
      enforce_admins?: Record<string, unknown> | null;
      required_pull_request_reviews?: Record<string, unknown> | null;
      restrictions?: Record<string, unknown> | null;
    };
    searchParams: { owner: string; repo: string; branch: string };
  };
  "GET /repos/:owner/:repo/actions/runs/:run_id": {
    response: Record<string, unknown> & {
      id: number;
      status?: string;
      conclusion?: string | null;
      created_at?: string;
      updated_at?: string;
    };
    searchParams: { owner: string; repo: string; run_id: number };
  };
  "GET /repos/:owner/:repo/actions/runs/:run_id/jobs": {
    response: { total_count: number; jobs: Array<Record<string, unknown>> };
    searchParams: {
      owner: string;
      repo: string;
      run_id: number;
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/branches": {
    response: Array<
      {
        name: string;
        commit: { sha: string; url: string };
        protected?: boolean;
      }
    >;
    searchParams: {
      owner: string;
      repo: string;
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/topics": {
    response: { names: string[] };
    searchParams: { owner: string; repo: string };
  };
  "GET /repos/:owner/:repo/languages": {
    response: Record<string, number>;
    searchParams: { owner: string; repo: string };
  };
  "GET /repos/:owner/:repo/stats/commit_activity": {
    response: Array<{ total: number; week: number; days: number[] }>;
    searchParams: { owner: string; repo: string };
  };
  "GET /search/issues": {
    response: {
      total_count: number;
      incomplete_results: boolean;
      items: Array<Record<string, unknown>>;
    };
    searchParams: {
      q: string;
      sort?: string;
      order?: "desc" | "asc";
      per_page?: number;
      page?: number;
    };
  };
  "GET /repos/:owner/:repo/tarball/:ref": {
    response: unknown;
    searchParams: { owner: string; repo: string; ref?: string };
  };
  "GET /repos/:owner/:repo/zipball/:ref": {
    response: unknown;
    searchParams: { owner: string; repo: string; ref?: string };
  };
  "GET /rate_limit": {
    response: Record<string, unknown> & {
      rate?: { limit: number; remaining: number; reset: number; used?: number };
      resources?: Record<
        string,
        { limit: number; remaining: number; reset: number; used?: number }
      >;
    };
    searchParams?: Record<string, never>;
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
