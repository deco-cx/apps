import { AppContext } from "../mod.ts";

/**
 * @name GET_RATE_LIMIT
 * @title Get Rate Limit
 * @description Get the current GitHub API rate limit status.
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
) => {
  const response = await ctx.client["GET /rate_limit"]({});
  return await response.json();
};

export default loader;
