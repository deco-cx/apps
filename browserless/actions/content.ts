import type { AppContext } from "../mod.ts";
import { ContentParams } from "../client.ts";

/**
 * @title Get Content
 * @description Returns the HTML content of a page
 */
export default async function content(
  props: ContentParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.getContent(props);
}
