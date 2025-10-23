import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_REPO_TEAMS
 * @title List Repository Teams
 * @description List teams with access to a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /repos/:owner/:repo/teams"]({
    owner: props.owner,
    repo: props.repo,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;
