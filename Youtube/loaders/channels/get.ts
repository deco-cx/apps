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

  try {
    const response = await client["GET /channels"]({ part, id, mine }, {
      headers: { Authorization: `Bearer ${accessToken}` },
      ...STALE
    });
    
    // Verificar erro de autenticação
    if (response.status === 401) {
      // Sinalizar que o token está expirado
      ctx.response.headers.set("X-Token-Expired", "true");
      ctx.response.headers.set("Cache-Control", "no-store");
      return null;
    }
    
    return (await response.json());
  } catch (error) {
    console.error("Erro ao buscar dados do canal:", error);
    return null;
  }
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: ChannelOptions, req: Request, ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  // Verificar se há flag de token expirado
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";
  
  // Não usar cache se não houver token, for canal do usuário autenticado, skipCache for verdadeiro
  // ou se o token estiver expirado
  if (!accessToken || (props.mine === true && !props.id) || props.skipCache || tokenExpired) {
    return null;
  }
  
  // Incluir fragmento do token na chave de cache
  const tokenFragment = accessToken.slice(-8);
  
  const params = new URLSearchParams([
    ["id", props.id || ""],
    ["part", props.part || "snippet"],
    ["mine", (props.mine || false).toString()],
    ["tokenId", tokenFragment],
  ]);
  
  params.sort();
  
  return `youtube-channel-${params.toString()}`;
};
