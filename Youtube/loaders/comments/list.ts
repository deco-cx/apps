import type { AppContext } from "../../mod.ts";
import { YouTubeCommentThreadListResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface CommentListParams {
  /**
   * @description ID do vídeo para carregar comentários
   */
  parentId: string;

  /**
   * @description Número máximo de resultados
   */
  maxResults?: number;

  /**
   * @description Token de paginação
   */
  pageToken?: string;

  /**
   * @description Ignorar cache para esta solicitação
   */
  skipCache?: boolean;
}

export interface CommentListResponse extends YouTubeCommentThreadListResponse {
  error?: {
    code: number;
    message: string;
    details?: unknown;
  };
}

/**
 * @title Load YouTube Comments
 * @description Carrega comentários de um vídeo específico do YouTube
 */
export default async function loader(
  props: CommentListParams,
  req: Request,
  ctx: AppContext,
): Promise<CommentListResponse | null> {
  const {
    parentId,
    maxResults = 20,
    pageToken,
    skipCache = false,
  } = props;

  if (!parentId) {
    return createErrorResponse(
      400,
      "ID do vídeo é obrigatório para carregar comentários",
    );
  }

  try {
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/commentThreads",
    );
    url.searchParams.set("part", "snippet,replies");
    url.searchParams.set("videoId", parentId);
    url.searchParams.set("maxResults", maxResults.toString());
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${ctx.access_token}`,
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
        } as CommentListResponse;
      }

      // Outros erros
      return createErrorResponse(
        response.status,
        `Erro ao carregar comentários: ${response.status} ${response.statusText}`,
        errorData,
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return createErrorResponse(
      500,
      `Erro ao carregar comentários para o vídeo ${parentId}`,
      error instanceof Error ? error.message : String(error),
    );
  }
}

// Função auxiliar para criar respostas de erro
function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): CommentListResponse {
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
  props: CommentListParams,
  req: Request,
  ctx: AppContext,
) => {
  if (props.skipCache) {
    return null;
  }

  const params = new URLSearchParams([
    ["parentId", props.parentId],
    ["maxResults", (props.maxResults || 20).toString()],
    ["pageToken", props.pageToken || ""],
  ]);

  // Ordenamos os parâmetros para garantir consistência na chave de cache
  params.sort();

  return `youtube-comments-${params.toString()}`;
};
