import type { AppContext } from "../../mod.ts";
import { getAccessToken } from "../../utils/cookieAccessToken.ts";
import type { YoutubePlaylistItemsResponse, YoutubeVideoListResponse } from "../../utils/types.ts";

export interface ChannelVideosOptions {
  /**
   * @description Número máximo de resultados por página
   */
  maxResults?: number;

  /**
   * @description Token para buscar a próxima página
   */
  pageToken?: string;

  /**
   * @description Token de acesso do YouTube (opcional)
   */
  tokenYoutube?: string;
}

/**
 * @title Listar Vídeos do Canal
 * @description Busca todos os vídeos do canal do usuário autenticado, incluindo vídeos privados
 */
export default async function loader(
  props: ChannelVideosOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoListResponse | null> {
  const { client } = ctx;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    return null;
  }

  const {
    maxResults = 50,
    pageToken,
  } = props;

  try {
    const channelResponse = await client["GET /channels"]({
      part: "contentDetails",
      mine: true,
    }, { headers: { Authorization: `Bearer ${accessToken}` } });
    
    const channelData = await channelResponse.json();
    
    if (!channelData.items || channelData.items.length === 0) {
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: { totalResults: 0, resultsPerPage: 0 },
        etag: "",
      };
    }
    
    const uploadsPlaylistId = channelData.items[0]?.contentDetails
      ?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: { totalResults: 0, resultsPerPage: 0 },
        etag: "",
      };
    }
    
    const playlistResponse = await client["GET /playlistItems"]({
      part: "snippet,status",
      playlistId: uploadsPlaylistId,
      maxResults,
      pageToken,
    }, { headers: { Authorization: `Bearer ${accessToken}` } });
    
    const playlistData = await playlistResponse.json()

    if (!playlistData.items || playlistData.items.length === 0) {
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: { totalResults: 0, resultsPerPage: 0 },
        etag: "",
      };
    }
    
    return {
      kind: "youtube#videoListResponse",
      items: playlistData.items.map((item) => {
        const thumbnails = {
          default: item.snippet.thumbnails.default,
          medium: item.snippet.thumbnails.medium || item.snippet.thumbnails.default,
          high: item.snippet.thumbnails.high || item.snippet.thumbnails.default,
          standard: item.snippet.thumbnails.standard,
          maxres: item.snippet.thumbnails.maxres
        };
        
        return {
          kind: "youtube#video",
          etag: item.etag,
          id: item.snippet.resourceId.videoId,
          snippet: {
            publishedAt: item.snippet.publishedAt,
            channelId: item.snippet.channelId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnails,
            channelTitle: item.snippet.channelTitle,
            categoryId: "",
            liveBroadcastContent: "none",
            localized: {
              title: item.snippet.title,
              description: item.snippet.description
            }
          },
          statistics: {
            viewCount: "0",
            likeCount: "0",
            favoriteCount: "0",
            commentCount: "0"
          },
          status: {
            uploadStatus: "processed",
            privacyStatus: item.status?.privacyStatus || "public",
            license: "youtube",
            embeddable: true,
            publicStatsViewable: true,
            madeForKids: false
          }
        };
      }),
      pageInfo: playlistData.pageInfo,
      etag: "",
      nextPageToken: playlistData.nextPageToken,
    };
    
  } catch (_error) {
    return {
      kind: "youtube#videoListResponse",
      items: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      etag: "",
    };
  }
}
