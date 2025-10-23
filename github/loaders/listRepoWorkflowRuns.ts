import { AppContext } from "../mod.ts";

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

/**
 * @name LIST_REPO_WORKFLOW_RUNS
 * @title List Repository Workflow Runs
 * @description List GitHub Actions workflow runs for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
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
  return await response.json();
};

export default loader;
