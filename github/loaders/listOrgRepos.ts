import { AppContext } from "../mod.ts";
import type { Repository } from "../utils/types.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

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
): Promise<StandardResponse<Repository>> => {
  const response = await ctx.client["GET /orgs/:org/repos"]({
    ...props,
  });
  const data = await response.json();
  const linkHeader = response.headers.get("link");

  return {
    data,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;
