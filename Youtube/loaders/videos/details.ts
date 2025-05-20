import type { AppContext } from "../../mod.ts";
import type {
  YouTubeCaptionListResponse,
  YoutubeVideoResponse,
} from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

/**
 * Opções para buscar detalhes de um vídeo
 */
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
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface VideoDetailsResult {
  video: YoutubeVideoResponse;
  captions?: YouTubeCaptionListResponse;
}

export interface VideoDetailsError {
  message: string;
  error: boolean;
  code?: number;
  details?: unknown;
}

export type VideoDetailsResponse = VideoDetailsResult | VideoDetailsError;

/**
 * @title YouTube Video Details
 * @description Obtém informações detalhadas sobre um vídeo específico pelo ID
 */
export default async function loader(
  props: VideoDetailsOptions,
  req: Request,
  ctx: AppContext,
): Promise<VideoDetailsResponse> {
  const client = ctx.client;

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
      ...STALE,
    });

    if (videoResponse.status === 401) {
      ctx.response.headers.set("X-Token-Expired", "true");
      ctx.response.headers.set("Cache-Control", "no-store");
      return createErrorResponse(
        401,
        "Token de autenticação expirado ou inválido",
      );
    }

    if (!videoResponse.ok) {
      return createErrorResponse(
        videoResponse.status,
        `Erro ao buscar detalhes do vídeo: ${videoResponse.status}`,
        await videoResponse.text(),
      );
    }

    const videoData = await videoResponse.json();

    if (!videoData.items || videoData.items.length === 0) {
      return createErrorResponse(404, `Vídeo não encontrado: ${videoId}`);
    }

    const result: VideoDetailsResult = {
      video: videoData,
    };

    if (includeCaptions) {
      try {
        const captionsResponse = await client["GET /captions"]({
          part: "snippet",
          videoId,
        }, {
          ...STALE,
        });

        if (captionsResponse.ok) {
          result.captions = await captionsResponse.json();
        }
      } catch (error) {
        // Ignora erros de legenda - não são críticos para o resultado
      }
    }

    return result;
  } catch (error) {
    return createErrorResponse(
      500,
      "Erro ao processar detalhes do vídeo",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): VideoDetailsError {
  return {
    message,
    error: true,
    code,
    details,
  };
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoDetailsOptions, req: Request) => {
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";

  if (!props.videoId || props.skipCache || tokenExpired) {
    return null;
  }

  const params = new URLSearchParams([
    ["videoId", props.videoId],
    ["parts", (props.parts || ["snippet", "statistics", "status"]).join(",")],
    ["includeCaptions", (props.includeCaptions ?? true).toString()],
    ["includePrivate", (props.includePrivate ?? false).toString()],
  ]);

  params.sort();

  return `youtube-video-details-${params.toString()}`;
};
