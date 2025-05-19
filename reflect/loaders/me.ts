import type { AppContext } from "../mod.ts";
import type { User } from "../client.ts";

/**
 * @name GetUser
 * @title Get Current User
 * @description Fetches the profile information for the authenticated user.
 */
export default async function getMe(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<User> {
  return await ctx.reflect.getMe();
}
