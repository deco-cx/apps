import { AppContext } from "../mod.ts";
import type { GithubIssue, GithubIssueLabel } from "../utils/types.ts";

interface RepoIdentify {
  owner?: string;
  repo?: string;
  url?: string;
}

export interface Props {
  repoIdentify: RepoIdentify;
  title: string;
  body?: string;
  labels?: string[];
}

interface IssueCreateResponse {
  created: true;
  number: number;
  url: string;
  title: string;
  body: string;
  labels: string[];
  user: string;
  created_at: string;
  message: string;
}

interface ErrorResponse {
  error: true;
  message: string;
}

/**
 * @name CREATE_ISSUE
 * @title Create Issue
 * @description Creates a new issue in a GitHub repository. Returns a friendly error if issues are disabled or required fields are missing.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<IssueCreateResponse | ErrorResponse> => {
  const { repoIdentify, title, body, labels } = props;
  let owner = repoIdentify?.owner;
  let repo = repoIdentify?.repo;
  const { url } = repoIdentify;

  if ((!owner || !repo) && url) {
    try {
      const match = url.match(/github.com\/(.+?)\/(.+?)(\/|$)/);
      if (match) {
        owner = match[1];
        repo = match[2];
      }
    } catch {
      return { error: true, message: "Invalid repository URL." };
    }
  }

  if (!owner || !repo) {
    return {
      error: true,
      message: "You must provide owner and repo or a valid repository URL.",
    };
  }
  if (!title) {
    return { error: true, message: "Title is required to create an issue." };
  }

  try {
    const response = await ctx.client["POST /repos/:owner/:repo/issues"](
      { owner, repo },
      { body: { title, body, labels } },
    );
    const data = await response.json();
    return mapIssueCreateResponse(data);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "response" in err &&
      typeof (err as { response?: { status?: number } }).response ===
        "object" &&
      (err as { response?: { status?: number } }).response?.status === 410
    ) {
      return {
        error: true,
        message:
          "The Issues tab is disabled for this repository. Please enable Issues in the repository settings to use this feature.",
      };
    }
    return {
      error: true,
      message: (err as Error)?.message || "Failed to create issue.",
    };
  }
};

function mapIssueCreateResponse(issue: GithubIssue): IssueCreateResponse {
  return {
    created: true,
    number: issue.number,
    url: issue.html_url,
    title: issue.title,
    body: issue.body,
    labels: issue.labels?.map((l: GithubIssueLabel | string) =>
      typeof l === "string" ? l : l.name
    ),
    user: issue.user?.login,
    created_at: issue.created_at,
    message: `Issue created successfully: ${issue.html_url}`,
  };
}

export default action;
