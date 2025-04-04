import type { AppContext } from "../../mod.ts";
import { getCookies } from "@std/http";
import getAccessToken from "../../utils/getAccessToken.ts";
import { YouTubeCommentThreadListResponse } from "../../utils/types.ts";

export interface ThreadListParams {
  videoId: string;
  maxResults?: number;
  pageToken?: string;
  order?: "time" | "relevance";
  tokenYoutube?: string;
}

/**
 * @title Carregar Threads de Comentários
 * @description Carrega as threads de comentários de um vídeo do YouTube
 */
const loader = async (
  props: ThreadListParams,
  req: Request,
  _ctx: AppContext,
): Promise<YouTubeCommentThreadListResponse | null> => {
  const { videoId, maxResults = 20, pageToken, order = "time", tokenYoutube } = props;
  const cookies = getCookies(req.headers);
  const accessToken = getAccessToken(req) || tokenYoutube || cookies.youtube_access_token;

  if (!accessToken) {
    console.error("Autenticação necessária para carregar threads de comentários");
    return null;
  }

  if (!videoId) {
    console.error("ID do vídeo é obrigatório para carregar threads de comentários");
    return null;
  }

  try {
    const url = new URL("https://youtube.googleapis.com/youtube/v3/commentThreads");
    url.searchParams.set("part", "snippet,replies");
    url.searchParams.set("videoId", videoId);
    url.searchParams.set("maxResults", maxResults.toString());
    url.searchParams.set("order", order);
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
          commentsDisabled: true
        } as YouTubeCommentThreadListResponse;
      }
      
      // Outros erros
      console.error(`Erro ao carregar threads de comentários: ${response.status} ${response.statusText}`, errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro ao carregar threads de comentários para o vídeo ${videoId}:`, error);
    return null;
  }
};

export default loader; 