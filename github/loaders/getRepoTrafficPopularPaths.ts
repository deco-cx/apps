import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

interface PopularPath {
  path: string;
  title: string;
  count: number;
  uniques: number;
}

/**
 * @name GET_REPO_TRAFFIC_POPULAR_PATHS
 * @title Get Repo Traffic Popular Paths
 * @description Get the top content paths over the last 14 days.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<PopularPath>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/traffic/popular/paths"](props);
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;
