import { AppContext } from "../mod.ts";

interface Props {
  owner: string;
  repo: string;
}

interface ClonesResponse {
  count: number;
  uniques: number;
  clones: Array<{ timestamp: string; count: number; uniques: number }>;
}

/**
 * @name GET_REPO_TRAFFIC_CLONES
 * @title Get Repository Traffic Clones
 * @description Get repository traffic clones for the last 14 days.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ClonesResponse> => {
  const response = await ctx.client["GET /repos/:owner/:repo/traffic/clones"]({
    ...props,
  });
  return await response.json();
};

export default loader;
