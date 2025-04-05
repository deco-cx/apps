import { ScreenshotParams } from "../client.ts";
import type { AppContext } from "../mod.ts";

/**
 * @title Take Screenshot
 * @description Captures a screenshot of a page
 */
export default async function screenshot(
  props: ScreenshotParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getScreenshot(props);
}
