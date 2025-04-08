import { UnblockParams } from "../client.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title Unblock Page
 * @description Bypasses protection on websites and returns content, screenshots, or cookies
 */
export default async function unblock(
  props: UnblockParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.unblock(props);
}
