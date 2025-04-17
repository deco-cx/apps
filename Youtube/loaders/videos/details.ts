import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type {
  YouTubeCaptionListResponse,
  YoutubeVideoResponse,
} from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoDetailsOptions {
  /**
   * @description ID do vídeo para buscar detalhes
   */
  videoId: string;
  /**
   * @description Partes adicionais a serem incluídas na resposta
   */
  parts?: Array<
    | "snippet"
    | "statistics"
    | "contentDetails"
    | "status"
    | "player"
    | "topicDetails"
    | "recordingDetails"
  >;

  /**
   * @description Incluir vídeos privados
   */
  includePrivate?: boolean;

  /**
   * @description Incluir legendas disponíveis
   */
  includeCaptions?: boolean;

  tokenYoutube?: string;

  skipCache?: boolean;
}

interface VideoDetailsResponse {
  video: YoutubeVideoResponse;
  captions?: YouTubeCaptionListResponse;
}

/**
 * @title YouTube Video Details
 * @description Fetches detailed information about a specific video by ID
 */
export default async function loader(
  props: VideoDetailsOptions,
  req: Request,
  ctx: AppContext,
): Promise<VideoDetailsResponse | null> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter detalhes do vídeo");
    return null;
  }

  const {
    videoId,
    parts = ["snippet", "statistics", "status"],
    includeCaptions = true,
  } = props;

  if (!videoId) {
    console.error("ID do vídeo é obrigatório");
    return null;
  }

  const partString = parts.join(",");

  const videoResponse = await client["GET /videos"]({
    part: partString,
    id: videoId,
  }, { 
    headers: { Authorization: `Bearer ${accessToken}` },
    ...STALE
  });
  
  // Verificar se houve erro de autenticação (token expirado)
  if (videoResponse.status === 401) {
    // Sinalizar que o token está expirado
    ctx.response.headers.set("X-Token-Expired", "true");
    ctx.response.headers.set("Cache-Control", "no-store");
    
    console.error("Token de autenticação expirado ou inválido");
    return null;
  }
  
  const videoData = await videoResponse.json();

  if (!videoData.items || videoData.items.length === 0) {
    console.error(`Vídeo não encontrado: ${videoId}`);
    return null;
  }

  const response: VideoDetailsResponse = {
    video: videoData,
  };

  if (includeCaptions) {
    try {
      const captionsData = await client["GET /captions"]({
        part: "snippet",
        videoId,
      }, { 
        headers: { Authorization: `Bearer ${accessToken}` },
        ...STALE 
      }).then((res) => res.json());

      response.captions = captionsData;
    } catch (error) {
      console.error(`Erro ao buscar legendas para o vídeo ${videoId}:`, error);
    }
  }

  return response;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoDetailsOptions, req: Request, ctx: AppContext) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  
  // Verificar se há flag de token expirado
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";
  
  // Não usar cache se não houver token, se skipCache for verdadeiro ou se o token estiver expirado
  if (!accessToken || !props.videoId || props.skipCache || tokenExpired) {
    return null;
  }
  
  // Incluir um fragmento do token na chave de cache
  const tokenFragment = accessToken.slice(-8);
  
  const params = new URLSearchParams([
    ["videoId", props.videoId],
    ["parts", (props.parts || ["snippet", "statistics", "status"]).join(",")],
    ["includeCaptions", (props.includeCaptions ?? true).toString()],
    ["includePrivate", (props.includePrivate ?? false).toString()],
    ["tokenId", tokenFragment],
  ]);
  
  params.sort();
  
  return `youtube-video-details-${params.toString()}`;
};
