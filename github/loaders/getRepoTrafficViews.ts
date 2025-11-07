import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

interface ViewData {
  timestamp: string;
  count: number;
  uniques: number;
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
): Promise<StandardResponse<ViewData>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/traffic/views"]({
    ...props,
  });
  const result = await response.json() as {
    count: number;
    uniques: number;
    views: ViewData[];
  };

  return {
    data: result.views,
    metadata: {
      total_count: result.count,
      uniques: result.uniques,
    },
  };
};

export default loader;
