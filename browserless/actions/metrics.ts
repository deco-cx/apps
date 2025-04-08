import type { AppContext } from "../mod.ts";

/**
 * @title Get Metrics
 * @description Retrieves metrics information about the worker
 */
export default async function metrics(
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getMetrics();
}
