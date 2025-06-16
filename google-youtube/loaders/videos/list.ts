import { AppContext } from "../../mod.ts";
import {
  YoutubeVideoListResponse,
  YoutubeVideoResponse,
} from "../../utils/types.ts";
import {
  DEFAULT_MAX_RESULTS,
  DEFAULT_ORDER,
  YOUTUBE_PARTS,
} from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Video ID
   * @description ID of the video to fetch details for
   */
  videoId?: string;

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

  /**
   * @title Order
   * @description Sort order for videos
   */
  order?:
    | "date"
    | "rating"
    | "relevance"
    | "title"
    | "videoCount"
    | "viewCount";

  /**
   * @title Query
   * @description Search term to filter videos
   */
  q?: string;

  /**
   * @title Parts
   * @description Parts to include in the response
   */
  part?: string;
}

/**
 * @name GET_VIDEOS
 * @title List YouTube Videos
 * @description Searches for YouTube videos with various filters
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoListResponse> => {
  const {
    videoId,
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
    order = DEFAULT_ORDER,
    q,
    part,
  } = props;

  try {
    if (videoId) {
      const videoResponse = await ctx.client["GET /videos"](
        {
          part: part ||
            `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATISTICS},${YOUTUBE_PARTS.STATUS}`,
          id: videoId,
        },
        {
          headers: ctx.tokens?.access_token
            ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
            : {},
        },
      );

      if (!videoResponse.ok) {
        ctx.errorHandler.toHttpError(
          videoResponse,
          `Failed to fetch video details: ${videoResponse.statusText}`,
        );
      }

      return await videoResponse.json();
    }

    const searchResponse = await ctx.client["GET /search"](
      {
        part: part || YOUTUBE_PARTS.SNIPPET,
        maxResults,
        order,
        type: "video",
        q,
        pageToken,
      },
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!searchResponse.ok) {
      ctx.errorHandler.toHttpError(
        searchResponse,
        `Failed to search videos: ${searchResponse.statusText}`,
      );
    }

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

      const detailsResponse = await ctx.client["GET /videos"](
        {
          part:
            `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATISTICS},${YOUTUBE_PARTS.STATUS}`,
          id: videoIds,
        },
        {
          headers: ctx.tokens?.access_token
            ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
            : {},
        },
      );

      if (!detailsResponse.ok) {
        ctx.errorHandler.toHttpError(
          detailsResponse,
          `Failed to fetch video details: ${detailsResponse.statusText}`,
        );
      }

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
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to list videos",
    );
  }
};

export default loader;
