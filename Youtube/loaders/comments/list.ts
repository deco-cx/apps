import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import { YouTubeCommentThreadListResponse } from "../../utils/types.ts";

export interface CommentListParams {
  parentId: string;
  maxResults?: number;
  pageToken?: string;
  tokenYoutube?: string;
}

/**
 * @title Carregar Comentários
 * @description Carrega os comentários de um thread específico do YouTube
 */
const loader = async (
  props: CommentListParams,
  req: Request,
  _ctx: AppContext,
): Promise<YouTubeCommentThreadListResponse | null> => {
  const { parentId, maxResults = 20, pageToken, tokenYoutube } = props;

  const accessToken = getAccessToken(req) || tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para carregar comentários");
    return null;
  }

  if (!parentId) {
    console.error("ID do vídeo é obrigatório para carregar comentários");
    return null;
  }

  try {
    const url = new URL(
      "https://youtube.googleapis.com/youtube/v3/commentThreads",
    );
    url.searchParams.set("part", "snippet,replies");
    url.searchParams.set("videoId", parentId);
    url.searchParams.set("maxResults", maxResults.toString());
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      // Verifica se o erro é porque os comentários estão desativados
      const errorData = await response.json();
      if (errorData?.error?.errors?.[0]?.reason === "commentsDisabled") {
        return {
          kind: "youtube#commentThreadListResponse",
          etag: "",
          items: [],
          // Adiciona uma propriedade para indicar que os comentários estão desativados
          commentsDisabled: true,
        } as YouTubeCommentThreadListResponse;
      }

      // Outros erros
      console.error(
        `Erro ao carregar comentários: ${response.status} ${response.statusText}`,
        errorData,
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      `Erro ao carregar comentários para o vídeo ${parentId}:`,
      error,
    );
    return null;
  }
};

export default loader;
