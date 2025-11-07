import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  visibility?: "all" | "public" | "private";
  affiliation?: string;
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_USER_REPOS
 * @title List Authenticated User Repositories
 * @description List repositories for the authenticated GitHub user.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<Repository>> => {
  const response = await ctx.client["GET /user/repos"]({
    ...props,
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
