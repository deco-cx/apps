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

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface VideoDetailsResponse {
  video: YoutubeVideoResponse;
  captions?: YouTubeCaptionListResponse;
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

/**
 * @title YouTube Video Details
 * @description Obtém informações detalhadas sobre um vídeo específico pelo ID
 */
export default async function loader(
  props: VideoDetailsOptions,
  req: Request,
  ctx: AppContext,
): Promise<VideoDetailsResponse | null> {
  const client = ctx.client;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    return createErrorResponse(401, "Autenticação necessária para obter detalhes do vídeo");
  }

  const {
    videoId,
    parts = ["snippet", "statistics", "status"],
    includeCaptions = true,
  } = props;

  if (!videoId) {
    return createErrorResponse(400, "ID do vídeo é obrigatório");
  }

  try {
    const partString = parts.join(",");

    const videoResponse = await client["GET /videos"]({
      part: partString,
      id: videoId,
    }, { 
      headers: { Authorization: `Bearer ${accessToken}` },
      ...STALE
    });
    
    if (videoResponse.status === 401) {
      ctx.response.headers.set("X-Token-Expired", "true");
      ctx.response.headers.set("Cache-Control", "no-store");
      return createErrorResponse(401, "Token de autenticação expirado ou inválido");
    }
    
    if (!videoResponse.ok) {
      return createErrorResponse(
        videoResponse.status,
        `Erro ao buscar detalhes do vídeo: ${videoResponse.status}`,
        await videoResponse.text()
      );
    }
    
    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return createErrorResponse(404, `Vídeo não encontrado: ${videoId}`);
    }

    const response: VideoDetailsResponse = {
      video: videoData,
    };

    if (includeCaptions) {
      try {
        const captionsResponse = await client["GET /captions"]({
          part: "snippet",
          videoId,
        }, { 
          headers: { Authorization: `Bearer ${accessToken}` },
          ...STALE 
        });
        
        if (captionsResponse.ok) {
          response.captions = await captionsResponse.json();
        }
      } catch (error) {
        // Ignora erros de legenda - não são críticos para o resultado
      }
    }

    return response;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar detalhes do vídeo",
      error instanceof Error ? error.message : String(error)
    );
  }
}

function createErrorResponse(code: number, message: string, details?: unknown): VideoDetailsResponse {
  return {
    video: {
      kind: "youtube#videoListResponse",
      items: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 }
    },
    error: {
      code,
      message,
      details
    }
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoDetailsOptions, req: Request) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";
  
  if (!accessToken || !props.videoId || props.skipCache || tokenExpired) {
    return null;
  }
  
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
