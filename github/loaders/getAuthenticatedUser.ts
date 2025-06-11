import { OverrideAuthHeaderProps } from "../../mcp/oauth.ts";
import { AppContext } from "../mod.ts";
import type { SimpleUser } from "../utils/types.ts";

/**
 * @name GET_USER
 * @title Get Authenticated User
 * @description Get the authenticated GitHub user.
 */
const loader = async (
  props: OverrideAuthHeaderProps,
  _req: Request,
  ctx: AppContext,
): Promise<SimpleUser> => {
  const opts: RequestInit = {};
  if (props.accessToken) {
    opts.headers = new Headers({
      "Authorization": `Bearer ${props.accessToken}`,
    });
  }
  const response = await ctx.client["GET /user"]({}, opts);
  return await response.json();
};

export default loader;
