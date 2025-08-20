import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  run_id: number;
}

/**
 * @name GET_WORKFLOW_RUN
 * @title Get Workflow Run
 * @description Get details for a specific GitHub Actions workflow run.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/actions/runs/:run_id"]({
      owner: props.owner,
      repo: props.repo,
      run_id: props.run_id,
    });
  return await response.json();
};

export default loader;
