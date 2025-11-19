import { AppContext } from "../mod.ts";
import { SingleObjectResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  run_id: number;
}

type WorkflowRunDetail = Record<string, unknown>;

/**
 * @name GET_WORKFLOW_RUN
 * @title Get Workflow Run
 * @description Get details for a specific GitHub Actions workflow run.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<WorkflowRunDetail>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/actions/runs/:run_id"]({
      owner: props.owner,
      repo: props.repo,
      run_id: props.run_id,
    });
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;
