import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";

interface Props {
  org: string;
  type?:
    | "all"
    | "public"
    | "private"
    | "forks"
    | "sources"
    | "member"
    | "internal";
  per_page?: number;
  page?: number;
}

/**
 * @name LIST_ORG_REPOS
 * @title List Organization Repositories
 * @description List repositories for a GitHub organization.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Repository[]> => {
  const response = await ctx.client["GET /orgs/:org/repos"]({
    ...props,
  });
  return await response.json();
};

export default loader;
