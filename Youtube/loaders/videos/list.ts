import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YoutubeVideoResponse } from "../../utils/types.ts";

export interface VideoListOptions {
  /**
   * ID do vídeo (opcional)
   */
  videoId?: string;
  /**
   * Número máximo de resultados por página
   */
  maxResults?: number;
  /**
   * Token para buscar a próxima página
   */
  pageToken?: string;
  /**
   * Ordenação dos vídeos
   */
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";
  /**
   * Filtro por palavra-chave
   */
  q?: string;

  tokenYoutube?: string;
}

/**
 * @title List YouTube Videos
 * @description Searches for YouTube videos with various filters
 */
export default async function loader(
  props: VideoListOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const client = ctx.api;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken && !props.tokenYoutube) {
    return null;
  }

  const { videoId, maxResults = 10, pageToken, order = "relevance", q } = props;

  // Se temos um ID específico, buscamos apenas esse vídeo
  if (videoId) {
    const videoResponse = await client["GET /videos"]({
      part: "snippet,statistics,status",
      id: videoId,
    }, { headers: { Authorization: `Bearer ${accessToken}` } });

    return await videoResponse.json();
  }

  // Caso contrário, realizamos uma busca
  const searchResponse = await client["GET /search"]({
    part: "snippet",
    q,
    maxResults,
    order,
    type: "video",
    pageToken,
  }, { headers: { Authorization: `Bearer ${accessToken}` } });

  const searchData = await searchResponse.json();

  if (searchData.items && searchData.items.length > 0) {
    const videoIds = searchData.items.map((item: unknown) => item.id.videoId)
      .join(
        ",",
      );

    const detailsResponse = await client["GET /videos"]({
      part: "snippet,statistics,status",
      id: videoIds,
    }, { headers: { Authorization: `Bearer ${accessToken}` } });

    const detailsData = await detailsResponse.json();

    return {
      kind: "youtube#videoListResponse",
      items: detailsData.items,
      nextPageToken: searchData.nextPageToken,
      pageInfo: searchData.pageInfo,
    };
  }

  return searchData;
}
