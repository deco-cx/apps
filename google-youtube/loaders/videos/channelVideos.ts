import { AppContext } from "../../mod.ts";
import { YoutubeVideoListResponse } from "../../utils/types.ts";
import { DEFAULT_MAX_RESULTS, YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Max Results
   * @description Maximum number of results per page
   */
  maxResults?: number;

  /**
   * @title Page Token
   * @description Token to fetch the next page of results
   */
  pageToken?: string;
}

interface PlaylistItem {
  etag: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    resourceId: {
      videoId: string;
    };
  };
  status?: {
    privacyStatus?: string;
  };
}

/**
 * @name GET_CHANNEL_VIDEOS
 * @title List Channel Videos
 * @description Fetches all videos from the authenticated user's channel, including private videos
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoListResponse> => {
  const {
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
  } = props;

  try {
    const channelResponse = await ctx.client["GET /channels"](
      {
        part: YOUTUBE_PARTS.CONTENT_DETAILS,
        mine: true,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!channelResponse.ok) {
      ctx.errorHandler.toHttpError(
        channelResponse,
        `Failed to fetch channel data: ${channelResponse.statusText}`,
      );
    }

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

    const playlistResponse = await ctx.client["GET /playlistItems"](
      {
        part: `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATUS}`,
        playlistId: uploadsPlaylistId,
        maxResults: maxResults,
        pageToken: pageToken,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!playlistResponse.ok) {
      ctx.errorHandler.toHttpError(
        playlistResponse,
        `Failed to fetch playlist items: ${playlistResponse.statusText}`,
      );
    }

    const playlistData = await playlistResponse.json();

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
      items: playlistData.items.map((item: PlaylistItem) => {
        const thumbnails = {
          default: item.snippet.thumbnails.default,
          medium: item.snippet.thumbnails.medium ||
            item.snippet.thumbnails.default,
          high: item.snippet.thumbnails.high || item.snippet.thumbnails.default,
          standard: item.snippet.thumbnails.standard,
          maxres: item.snippet.thumbnails.maxres,
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
              description: item.snippet.description,
            },
          },
          statistics: {
            viewCount: "0",
            likeCount: "0",
            favoriteCount: "0",
            commentCount: "0",
          },
          status: {
            uploadStatus: "processed",
            privacyStatus: item.status?.privacyStatus || "public",
            license: "youtube",
            embeddable: true,
            publicStatsViewable: true,
            madeForKids: false,
          },
        };
      }),
      pageInfo: playlistData.pageInfo,
      etag: "",
      nextPageToken: playlistData.nextPageToken,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to fetch channel videos",
    );
  }
};

export default loader;
