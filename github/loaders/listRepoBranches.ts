import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
  per_page?: number;
  page?: number;
}

type Branch = Record<string, unknown>;

/**
 * @name LIST_REPO_BRANCHES
 * @title List Repository Branches
 * @description List branches in a repository.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Branch>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/branches"]({
    owner: props.owner,
    repo: props.repo,
    per_page: props.per_page,
    page: props.page,
  });
  const data = await response.json();
  
  return {
    data,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      has_next_page: props.per_page ? data.length === props.per_page : undefined,
    },
  };
};

export default loader;
