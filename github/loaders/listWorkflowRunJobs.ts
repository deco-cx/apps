import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  run_id: number;
  per_page?: number;
  page?: number;
}

type WorkflowJob = Record<string, unknown>;

/**
 * @name LIST_WORKFLOW_RUN_JOBS
 * @title List Jobs for Workflow Run
 * @description List jobs for a specific GitHub Actions workflow run.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<WorkflowJob>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/actions/runs/:run_id/jobs"]({
      owner: props.owner,
      repo: props.repo,
      run_id: props.run_id,
      per_page: props.per_page,
      page: props.page,
    });
  const result = await response.json() as {
    jobs: Record<string, unknown>[];
    total_count: number;
  };
  const linkHeader = response.headers.get("link");

  return {
    data: result.jobs,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      total_count: result.total_count,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;
