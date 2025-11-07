import { AppContext } from "../mod.ts";
import {
  hasNextPageFromLinkHeader,
  StandardResponse,
} from "../utils/response.ts";

interface Props {
  q: string;
  sort?: string;
  order?: "desc" | "asc";
  per_page?: number;
  page?: number;
}

type SearchResultItem = Record<string, unknown>;

/**
 * @name SEARCH_ISSUES_AND_PRS
 * @title Search Issues and Pull Requests
 * @description Search issues and PRs using the GitHub Search API.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<SearchResultItem>> => {
  const response = await ctx.client["GET /search/issues"]({
    q: props.q,
    sort: props.sort,
    order: props.order,
    per_page: props.per_page,
    page: props.page,
  });
  const result = await response.json() as {
    items: Record<string, unknown>[];
    total_count: number;
  };
  const linkHeader = response.headers.get("link");

  return {
    data: result.items,
    metadata: {
      page: props.page,
      per_page: props.per_page,
      total_count: result.total_count,
      has_next_page: hasNextPageFromLinkHeader(linkHeader),
    },
  };
};

export default loader;
