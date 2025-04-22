import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { YouTubeCommentThreadListResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface ThreadListParams {
  /**
   * @description ID do vídeo para buscar threads de comentários
   */
  videoId: string;

  /**
   * @description Número máximo de resultados
   */
  maxResults?: number;

  /**
   * @description Token de paginação
   */
  pageToken?: string;

  /**
   * @description Ordenação dos comentários (tempo ou relevância)
   */
  order?: "time" | "relevance";

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;

  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface ThreadListResponse extends YouTubeCommentThreadListResponse {
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

/**
 * @title Carregar Threads de Comentários
 * @description Carrega as threads de comentários de um vídeo do YouTube
 */
export default async function loader(
  props: ThreadListParams,
  req: Request,
  _ctx: AppContext,
): Promise<ThreadListResponse | null> {
  const {
    videoId,
    maxResults = 20,
    pageToken,
    order = "time",
    tokenYoutube,
    skipCache = false,
  } = props;
  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    return createErrorResponse(
      401,
      "Autenticação necessária para carregar threads de comentários",
    );
  }

  if (!videoId) {
    return createErrorResponse(
      400,
      "ID do vídeo é obrigatório para carregar threads de comentários",
    );
  }

  try {
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/commentThreads",
    );
    url.searchParams.set("part", "snippet,replies");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("maxResults", maxResults.toString());
    url.searchParams.set("order", order);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      ...STALE,
    });

    if (!response.ok) {
      // Verifica se o erro é porque os comentários estão desativados
      const errorData = await response.json().catch(() => response.text());
      if (errorData?.error?.errors?.[0]?.reason === "commentsDisabled") {
        return {
          kind: "youtube#commentThreadListResponse",
          etag: "",
          items: [],
          // Adiciona uma propriedade para indicar que os comentários estão desativados
          commentsDisabled: true,
        } as ThreadListResponse;
      }

      // Outros erros
      return createErrorResponse(
        response.status,
        `Erro ao carregar threads de comentários: ${response.status} ${response.statusText}`,
        errorData,
      );
    }

    return await response.json();
  } catch (error) {
    return createErrorResponse(
      500,
      `Erro ao carregar threads de comentários para o vídeo ${videoId}`,
      error instanceof Error ? error.message : String(error),
    );
  }
}

// Função auxiliar para criar respostas de erro
function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): ThreadListResponse {
  return {
    kind: "youtube#commentThreadListResponse",
    etag: "",
    items: [],
    error: {
      code,
      message,
      details,
    },
  };
}

// Define a estratégia de cache como stale-while-revalidate
export const cache = "stale-while-revalidate";

// Define a chave de cache com base nos parâmetros da requisição
export const cacheKey = (
  props: ThreadListParams,
  req: Request,
  _ctx: AppContext,
) => {
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  // Não usar cache se não houver token ou se skipCache for verdadeiro
  if (!accessToken || props.skipCache) {
    return null;
  }

  const params = new URLSearchParams([
    ["videoId", props.videoId],
    ["maxResults", (props.maxResults || 20).toString()],
    ["pageToken", props.pageToken || ""],
    ["order", props.order || "time"],
  ]);

  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();

  return `youtube-comment-threads-${params.toString()}`;
};
