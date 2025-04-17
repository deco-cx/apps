import { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YoutubeChannelResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

interface ChannelOptions {
  mine?: boolean;
  part?: string;
  id?: string;
  tokenYoutube?: string;
  skipCache?: boolean;
}

/**
 * @title Fetch YouTube Channels
 * @description Retrieves information about YouTube channels for the authenticated user or by specific ID
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
    ...STALE
  })).json();
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: ChannelOptions, req: Request, ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  if (!accessToken) {
    return null;
  }
  
  // Não fazemos cache para canais do usuário autenticado,
  // pois os dados podem mudar com frequência
  if (props.mine === true && !props.id) {
    return null;
  }
  
  if (props.skipCache) {
    return null;
  }
  
  const params = new URLSearchParams([
    ["id", props.id || ""],
    ["part", props.part || "snippet"],
    ["mine", (props.mine || false).toString()],
  ]);
  
  params.sort();
  
  return `youtube-channel-${params.toString()}`;
};
