import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
}

interface ViewsResponse {
  count: number;
  uniques: number;
  views: Array<{ timestamp: string; count: number; uniques: number }>;
}

/**
 * @name GET_REPO_TRAFFIC_VIEWS
 * @title Get Repository Traffic Views
 * @description Get repository traffic views for the last 14 days.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ViewsResponse> => {
  const response = await ctx.client["GET /repos/:owner/:repo/traffic/views"]({
    ...props,
  });
  return await response.json();
};

export default loader;
