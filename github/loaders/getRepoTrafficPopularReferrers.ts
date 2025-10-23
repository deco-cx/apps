import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
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
) => {
  const response = await ctx.client
    ["GET /repos/:owner/:repo/traffic/popular/referrers"](props);
  return await response.json();
};

export default loader;
