import type { AppContext } from "../mod.ts";
import type { YoutubeChannelResponse } from "../utils/types.ts";

/**
 * @title Fetch YouTube Channels
 */
export default async function loader(
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeChannelResponse> {
  const response = await ctx.api[`GET /channels`]({
    query: {
      part: "snippet",
      mine: true,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch channels");
  }

  const result = await response.json();
  return result;
};