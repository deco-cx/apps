import type { AppContext } from "../mod.ts";
import { FunctionParams } from "../client.ts";

/**
 * @title Execute Function
 * @description Runs JavaScript code in the browser context
 */
export default async function executeFunction<T = unknown>(
  props: FunctionParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.executeFunction<T>(props);
}
