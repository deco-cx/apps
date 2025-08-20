import { AppContext } from "../mod.ts";

interface Props {
  q: string;
  sort?: string;
  order?: "desc" | "asc";
  per_page?: number;
  page?: number;
}

/**
 * @name SEARCH_ISSUES_AND_PRS
 * @title Search Issues and Pull Requests
 * @description Search issues and PRs using the GitHub Search API.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /search/issues"]({
    q: props.q,
    sort: props.sort,
    order: props.order,
    per_page: props.per_page,
    page: props.page,
  });
  return await response.json();
};

export default loader;
