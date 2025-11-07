import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

interface PopularReferrer {
  referrer: string;
  count: number;
  uniques: number;
}

/**
 * @name GET_REPO_TRAFFIC_POPULAR_REFERRERS
 * @title Get Repo Traffic Popular Referrers
 * @description Get the top referrers over the last 14 days.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<StandardResponse<PopularReferrer>> => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/traffic/popular/referrers"](props);
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;
