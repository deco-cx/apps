import type { AppContext } from "../mod.ts";

/**
 * @title Get Config
 * @description Retrieves configuration information
 */
export default async function config(
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getConfig();
}
