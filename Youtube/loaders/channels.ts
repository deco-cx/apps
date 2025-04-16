import type { AppContext } from "../mod.ts";
import { getAccessToken } from "../utils/cookieAccessToken.ts";
import type { YoutubeChannelResponse } from "../utils/types.ts";

interface ChannelOptions {
  mine?: boolean;
  part?: string;
  id?: string;
  tokenYoutube?: string;
}

/**
 * @title Fetch YouTube Channels
 */
export default async function loader(
  props: ChannelOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeChannelResponse | null> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken && !props.tokenYoutube) {
    return null;
  }
  const { part = "snippet", id, mine = true } = props;

  return (await client["GET /channels"]({ part, id, mine }, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })).json();
}
