import { AppContext } from "../mod.ts";
import { SingleObjectResponse } from "../utils/response.ts";

type RateLimitInfo = Record<string, unknown>;

/**
 * @name GET_RATE_LIMIT
 * @title Get Rate Limit
 * @description Get the current GitHub API rate limit status.
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<SingleObjectResponse<RateLimitInfo>> => {
  const response = await ctx.client["GET /rate_limit"]({});
  const data = await response.json();

  return {
    data,
    metadata: {},
  };
};

export default loader;
