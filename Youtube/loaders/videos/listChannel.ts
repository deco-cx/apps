import type { AppContext } from "../../mod.ts";
import getAccessToken from "../../utils/getAccessToken.ts";
import type { YoutubeVideoResponse } from "../../utils/types.ts";

export interface ChannelVideosOptions {
  /**
   * @description ID of the channel to search videos
   */
  channelId: string;
  /**
   * @description Maximum number of results per page
   */
  maxResults?: number;
  /**
   * @description Token to search the next page
   */
  pageToken?: string;
  /**
   * @description Order the videos
   */
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";
  /**
   * @description Include private videos (requires appropriate authorization)
   */
  includePrivate?: boolean;

  tokenYoutube?: string;
}

/**
 * @title List Videos of a Channel
 * @description Search videos of a specific YouTube channel
 */
export default async function loader(
  props: ChannelVideosOptions,
  req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const client = ctx.api;
  const accessToken = getAccessToken(req) || props.tokenYoutube;

  if (!accessToken) {
    console.error("Autenticação necessária para listar vídeos do canal");
    return null;
  }

  const {
    channelId,
    maxResults = 10,
    pageToken,
    order = "date",
    includePrivate = true,
  } = props;

  if (!channelId) {
    console.error("ID do canal é obrigatório");
    return null;
  }

  if (!includePrivate) {
    return await ctx.invoke.loaders.videos.search(
      {
        channelId,
        maxResults,
        pageToken,
        order,
        q: "",
      },
      req,
      ctx,
    );
  }

  const channelData = await client["GET /channels"]({
    part: "contentDetails",
    id: channelId,
  }, { headers: { Authorization: `Bearer ${accessToken}` } }).then((res) =>
    res.json()
  );

  if (!channelData.items || channelData.items.length === 0) {
    console.error(`Canal não encontrado: ${channelId}`);
    return null;
  }

  const uploadsPlaylistId = channelData?.items[0]?.contentDetails
    ?.relatedPlaylists?.uploads;

  if (!uploadsPlaylistId) {
    console.error(
      `Playlist de uploads não encontrada para o canal: ${channelId}`,
    );
    return null;
  }

  // Busca os vídeos da playlist de uploads
  const data = await client["GET /playlistItems"]({
    part: "snippet,status",
    playlistId: uploadsPlaylistId,
    maxResults,
    pageToken,
  }, { headers: { Authorization: `Bearer ${accessToken}` } }).then((res) =>
    res.json()
  );

  // Certifica que temos items antes de processar
  if (!data.items || data.items.length === 0) {
    return {
      kind: "youtube#videoListResponse",
      items: [],
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
    };
  }

  // Formata a resposta
  const response = {
    kind: "youtube#videoListResponse",
    items: data.items.map((item: unknown) => ({
      id: item.snippet.resourceId.videoId,
      snippet: item.snippet,
    })),
    nextPageToken: data.nextPageToken,
    pageInfo: data.pageInfo,
  };

  // Busca detalhes adicionais (estatísticas) para todos os vídeos em uma única chamada
  if (response.items.length > 0) {
    const videoIds = response.items.map((item) => item.id).join(",");

    const detailsData = await client["GET /videos"]({
      part: "snippet,statistics,status",
      id: videoIds,
    }, { headers: { Authorization: `Bearer ${accessToken}` } }).then((res) =>
      res.json()
    );

    if (detailsData.items && detailsData.items.length > 0) {
      response.items = detailsData.items;
    }
  }
  return response;
}
