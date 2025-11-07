import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  per_page?: number;
  page?: number;
}

type Workflow = Record<string, unknown>;

/**
 * @name LIST_REPO_WORKFLOWS
 * @title List Repository Workflows
 * @description List GitHub Actions workflows for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Workflow>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/actions/workflows"]({
      owner: props.owner,
      repo: props.repo,
      per_page: props.per_page,
      page: props.page,
    });
  const result = await response.json() as {
    workflows: Record<string, unknown>[];
    total_count: number;
  };

  return {
    data: result.workflows,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      total_count: result.total_count,
      has_next_page: props.per_page
        ? result.workflows.length === props.per_page
        : undefined,
    },
  };
};

export default loader;
