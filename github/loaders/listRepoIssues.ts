import { AppContext } from "../mod.ts";
import type {
  GithubIssue,
  GithubIssueAssignee,
  GithubIssueClean,
  GithubIssueLabel,
} from "../utils/types.ts";

interface RepoIdentify {
  owner?: string;
  repo?: string;
  url?: string;
}

interface IssueFilters {
  state?: "open" | "closed" | "all";
  per_page?: number;
  page?: number;
  labels?: string;
}

export interface Props {
  repoIdentify: RepoIdentify;
  issueFilters: IssueFilters;
}

/**
 * @name LIST_REPO_ISSUES
 * @title Listar Issues do Repositório
 * @description Fetches and returns only real issues (not PRs) from a GitHub repository with clean fields and friendly error handling.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<GithubIssueClean[] | { error: true; message: string }> => {
  const { repoIdentify, issueFilters } = props;
  const { url } = repoIdentify;
  const { state, per_page, page, labels } = issueFilters;
  let owner = repoIdentify?.owner;
  let repo = repoIdentify?.repo;

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

  try {
    const response = await ctx.client["GET /repos/:owner/:repo/issues"]({
      owner,
      repo,
      state,
      per_page,
      page,
      labels,
    });
    const issues: GithubIssue[] = await response.json();
    return mapIssues(issues);
  } catch (err: unknown) {
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
      message: (err as Error)?.message ||
        "Failed to fetch issues from the repository.",
    };
  }
};

function mapIssues(issues: GithubIssue[]): GithubIssueClean[] {
  return issues
    .filter((issue) => !issue.pull_request)
    .map((issue) => ({
      number: issue.number,
      state: issue.state,
      title: issue.title,
      body: issue.body,
      url: issue.html_url,
      labels: issue.labels?.map((l: GithubIssueLabel | string) =>
        typeof l === "string" ? l : l.name
      ),
      user: issue.user?.login,
      created_at: issue.created_at,
      closed_at: issue.closed_at,
      comments: issue.comments,
      assignees: issue.assignees?.map((a: GithubIssueAssignee) => a.login),
    }));
}

export default loader;
