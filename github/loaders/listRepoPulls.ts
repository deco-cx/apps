import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  state?: "open" | "closed" | "all";
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_PULLS
 * @title List Repository Pull Requests
 * @description List pull requests for a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/pulls"]({
    owner: props.owner,
    repo: props.repo,
    state: props.state,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;
