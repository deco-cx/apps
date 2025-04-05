import type { AppContext } from "../mod.ts";
import { ScrapeParams } from "../client.ts";

/**
 * @title Scrape Page
 * @description Extracts structured data from a page
 */
export default async function scrape<T = Record<string, unknown>>(
  props: ScrapeParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.scrape<T>(props);
}
