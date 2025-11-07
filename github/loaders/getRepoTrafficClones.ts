import { AppContext } from "../mod.ts";
import { StandardResponse } from "../utils/response.ts";

interface Props {
  owner: string;
  repo: string;
}

interface CloneData {
  timestamp: string;
  count: number;
  uniques: number;
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
): Promise<StandardResponse<CloneData>> => {
  const response = await ctx.client["GET /repos/:owner/:repo/traffic/clones"]({
    ...props,
  });
  const result = await response.json() as {
    count: number;
    uniques: number;
    clones: CloneData[];
  };

  return {
    data: result.clones,
    metadata: {
      total_count: result.count,
      uniques: result.uniques,
    },
  };
};

export default loader;
