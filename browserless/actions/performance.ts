import type { AppContext } from "../mod.ts";
import { PerformanceParams } from "../client.ts";

/**
 * @title Test Performance
 * @description Runs Google Lighthouse tests on a page
 */
export default async function performance(
  props: PerformanceParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.testPerformance(props);
}
