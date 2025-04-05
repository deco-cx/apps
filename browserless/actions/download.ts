import type { DownloadParams } from "../client.ts";
import type { AppContext } from "../mod.ts";
/**
 * @title Download File
 * @description Downloads files using the browser
 */
export default async function download(
  props: DownloadParams,
  _req: Request,
  ctx: AppContext,
): Promise<unknown> {
  return await ctx.browserless.download(props);
}
