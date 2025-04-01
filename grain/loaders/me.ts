import type { AppContext } from "../mod.ts";
import type { GrainMe } from "../client.ts";

/**
 * @name Get Authenticated User
 * @title Get Me
 * @description Fetches the profile information for the authenticated user associated with the provided token.
 */
export default async function getMe(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<GrainMe> {
  return await ctx.grain.getMe();
}
