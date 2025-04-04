import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";
import type { YoutubeVideoResponse, YouTubeCaptionListResponse } from "../../utils/types.ts";

export interface VideoDetailsOptions {
  /**
   * @description ID do vídeo para buscar detalhes
   */
  videoId: string;
  /**
   * @description Partes adicionais a serem incluídas na resposta
   */
  parts?: Array<"snippet" | "statistics" | "contentDetails" | "status" | "player" | "topicDetails" | "recordingDetails">;

  /**
   * @description Incluir vídeos privados
   */
  includePrivate?: boolean;

  /**
   * @description Incluir legendas disponíveis
   */
  includeCaptions?: boolean;

  tokenYoutube?: string;
}

interface VideoDetailsResponse {
  video: YoutubeVideoResponse;
  captions?: YouTubeCaptionListResponse;
}

/**
 * @title Detalhes de Vídeo do YouTube
 * @description Busca informações detalhadas de um vídeo específico pelo ID
 */
export default async function loader(
  props: VideoDetailsOptions,
  req: Request,
  ctx: AppContext,
): Promise<VideoDetailsResponse | null> {
  const client = ctx.api;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para obter detalhes do vídeo");
    return null;
  }

  const { videoId, parts = ["snippet", "statistics", "status"], includeCaptions = true } = props;

  if (!videoId) {
    console.error("ID do vídeo é obrigatório");
    return null;
  }

  const partString = parts.join(",");

  const videoData = await client["GET /videos"]({
    part: partString,
    id: videoId,
  }, { headers: { Authorization: `Bearer ${accessToken}` } }).then(res => res.json());

  if (!videoData.items || videoData.items.length === 0) {
    console.error(`Vídeo não encontrado: ${videoId}`);
    return null;
  }

  const response: VideoDetailsResponse = {
    video: videoData
  };

  if (includeCaptions) {
    try {
      const captionsData = await client["GET /captions"]({
        part: "snippet",
        videoId,
      }, { headers: { Authorization: `Bearer ${accessToken}` } }).then(res => res.json());
      
      response.captions = captionsData;
    } catch (error) {
      console.error(`Erro ao buscar legendas para o vídeo ${videoId}:`, error);
    }
  }

  return response;
} 