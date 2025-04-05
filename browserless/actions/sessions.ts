import type { AppContext } from "../mod.ts";

/**
 * @title Get Sessions
 * @description Retrieves information about currently running sessions
 */
export default async function sessions(
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getSessions();
}
