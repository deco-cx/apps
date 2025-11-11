import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  per_page?: number;
  page?: number;
  status?: string;
  event?: string;
  created?: string;
  branch?: string;
}

type WorkflowRun = Record<string, unknown>;

/**
 * @name LIST_REPO_WORKFLOW_RUNS
 * @title List Repository Workflow Runs
 * @description List GitHub Actions workflow runs for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<WorkflowRun>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/actions/runs"]({
    owner: props.owner,
    repo: props.repo,
    per_page: props.per_page,
    page: props.page,
    status: props.status,
    event: props.event,
    created: props.created,
    branch: props.branch,
  });
  const result = await response.json() as {
    workflow_runs: Record<string, unknown>[];
    total_count: number;
  };
  const linkHeader = response.headers.get("link");

  return {
    data: result.workflow_runs,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      total_count: result.total_count,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;
