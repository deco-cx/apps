import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  run_id: number;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_WORKFLOW_RUN_JOBS
 * @title List Jobs for Workflow Run
 * @description List jobs for a specific GitHub Actions workflow run.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/actions/runs/:run_id/jobs"]({
      owner: props.owner,
      repo: props.repo,
      run_id: props.run_id,
      per_page: props.per_page,
      page: props.page,
    });
  return await response.json();
};

export default loader;
