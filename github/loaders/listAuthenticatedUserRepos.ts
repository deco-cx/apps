import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";

interface Props {
  visibility?: "all" | "public" | "private";
  affiliation?: string;
  per_page?: number;
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
): Promise<{ data: Repository[] }> => {
  const response = await ctx.client["GET /user/repos"]({
    ...props,
  });
  const data = await response.json();
  return { data };
};

export default loader;
