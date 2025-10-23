import { AppContext } from "../mod.ts";

interface RepoIdentify {
  owner?: string;
  repo?: string;
  url?: string;
}

export interface Props {
  repoIdentify: RepoIdentify;
  issueNumber: number;
  body: string;
}

interface CommentResponse {
  created: true;
  url: string;
  body: string;
  user: string;
  created_at: string;
  message: string;
}

interface ErrorResponse {
  error: true;
  message: string;
}

interface GithubIssueComment {
  id: number;
  html_url: string;
  body: string;
  user: { login: string };
  created_at: string;
  [key: string]: unknown;
}

/**
 * @name COMMENT_ISSUE
 * @title Comment on Issue
 * @description Adds a comment to a GitHub issue. Returns a clean object with the comment link and details, or a friendly error.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CommentResponse | ErrorResponse> => {
  const { repoIdentify, issueNumber, body } = props;
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
  if (!issueNumber) {
    return { error: true, message: "You must provide the issue number." };
  }
  if (!body) {
    return { error: true, message: "Comment body is required." };
  }

  try {
    const response = await ctx.client
      ["POST /repos/:owner/:repo/issues/:issue_number/comments"](
        { owner, repo, issue_number: issueNumber },
        { body: { body } },
      );
    const data: GithubIssueComment = await response.json();
    return mapCommentResponse(data);
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
      message: (err as Error)?.message || "Failed to comment on issue.",
    };
  }
};

function mapCommentResponse(comment: GithubIssueComment): CommentResponse {
  return {
    created: true,
    url: comment.html_url,
    body: comment.body,
    user: comment.user?.login,
    created_at: comment.created_at,
    message: `Comment created successfully: ${comment.html_url}`,
  };
}

export default action;
