import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type {
  YoutubeVideoListResponse,
  YoutubeVideoResponse,
} from "../../utils/types.ts";

export interface VideoListOptions {
  /**
   * @title ID do vídeo (opcional)
   */
  videoId?: string;

  /**
   * @title Número máximo de resultados por página
   */
  maxResults?: number;

  /**
   * @title Token para buscar a próxima página
   */
  pageToken?: string;

  /**
   * @title Ordenação dos vídeos
   */
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";

  /**
   * @title Filtro por palavra-chave
   */
  q?: string;

  /**
   * @title
   */
  part?: string;
}

/**
 * @title List YouTube Videos
 * @description Searches for YouTube videos with various filters
 */
export default async function loader(
  props: VideoListOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoListResponse | null> {
  const { client } = ctx;

  const { videoId, maxResults = 10, pageToken, order = "relevance", q, part } =
    props;

  if (videoId) {
    const videoResponse = await client["GET /videos"]({
      part: part || "snippet,statistics,status",
      id: videoId,
    });

    return await videoResponse.json();
  }

  const searchResponse = await client["GET /search"]({
    part: part || "snippet",
    q,
    maxResults,
    order,
    type: "video",
    pageToken,
  });

  const searchData = await searchResponse.json() as YoutubeVideoResponse;

  if (searchData.items && searchData.items.length > 0) {
    const videoIds = searchData.items
      .map((item) => {
        return typeof item.id === "object" && "videoId" in item.id
          ? item.id.videoId
          : typeof item.id === "string"
          ? item.id
          : "";
      })
      .filter((id) => id)
      .join(",");

    const detailsResponse = await client["GET /videos"]({
      part: "snippet,statistics,status",
      id: videoIds,
    });

    const detailsData = await detailsResponse
      .json() as YoutubeVideoListResponse;

    return {
      kind: "youtube#videoListResponse",
      items: detailsData.items,
      nextPageToken: searchData.nextPageToken,
      pageInfo: searchData.pageInfo || { totalResults: 0, resultsPerPage: 0 },
      etag: detailsData.etag,
    };
  }

  const defaultPageInfo = { totalResults: 0, resultsPerPage: 0 };
  return {
    kind: "youtube#videoListResponse",
    items: [],
    pageInfo: searchData.pageInfo ? searchData.pageInfo : defaultPageInfo,
    etag: "",
  };
}
