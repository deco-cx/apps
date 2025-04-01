import type { AppContext } from "../../mod.ts";
import type { GrainHook } from "../../client.ts";

/**
 * @name GetHooks
 * @title List Webhooks
 * @description Fetches a list of webhooks (REST Hooks) created by the authenticated user.
 */
export default async function listHooks(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<{ hooks: GrainHook[] }> {
  return await ctx.grain.getHooks();
}
