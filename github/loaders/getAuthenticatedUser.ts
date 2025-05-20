import { AppContext } from "../mod.ts";
import type { SimpleUser } from "../utils/types.ts";

/**
 * @name GET_USER
 * @title Get Authenticated User
 * @description Get the authenticated GitHub user.
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<SimpleUser> => {
  const response = await ctx.client["GET /user"]({});
  return await response.json();
};

export default loader; 