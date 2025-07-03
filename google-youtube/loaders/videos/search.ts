import { AppContext } from "../../mod.ts";
import { YoutubeVideoResponse } from "../../utils/types.ts";
import {
  COMMON_ERROR_MESSAGES,
  DEFAULT_MAX_RESULTS,
  DEFAULT_ORDER,
  YOUTUBE_PARTS,
} from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Search Query
   * @description Search query term for videos
   */
  q: string;

  /**
   * @title Max Results
   * @description Maximum number of results per page
   */
  maxResults?: number;

  /**
   * @title Page Token
   * @description Token for fetching the next page
   */
  pageToken?: string;

  /**
   * @title Order
   * @description Video ordering method
   */
  order?: "date" | "rating" | "relevance" | "title" | "viewCount";

  /**
   * @title Channel ID
   * @description Channel ID to filter results
   */
  channelId?: string;

  /**
   * @title Published After
   * @description Minimum publication date (ISO 8601 format)
   */
  publishedAfter?: string;

  /**
   * @title Published Before
   * @description Maximum publication date (ISO 8601 format)
   */
  publishedBefore?: string;

  /**
   * @title Video Category ID
   * @description Video category ID
   */
  videoCategoryId?: string;

  /**
   * @title Region Code
   * @description Region code for search (ISO 3166-1 alpha-2)
   */
  regionCode?: string;

  /**
   * @title Relevance Language
   * @description Language code (ISO 639-1)
   */
  relevanceLanguage?: string;

  /**
   * @title Include Private
   * @description Include private videos (when authenticated)
   */
  includePrivate?: boolean;

  /**
   * @title Only Shorts
   * @description Filter only Shorts videos
   */
  onlyShorts?: boolean;

  /**
   * @title Exclude Shorts
   * @description Exclude Shorts from results
   */
  excludeShorts?: boolean;

  /**
   * @title Max Duration
   * @description Maximum video duration in seconds
   */
  maxDuration?: number;
}

/**
 * @name SEARCH_VIDEOS
 * @title Search YouTube Videos
 * @description Searches YouTube videos with various filtering criteria, including advanced options for Shorts
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeVideoResponse> => {
  const {
    q,
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
    order = DEFAULT_ORDER,
    channelId,
    publishedAfter,
    publishedBefore,
    videoCategoryId,
    regionCode,
    relevanceLanguage,
    includePrivate = false,
    onlyShorts = false,
    excludeShorts = false,
    maxDuration,
  } = props;

  if (!q) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_QUERY),
      COMMON_ERROR_MESSAGES.MISSING_QUERY,
    );
  }

  if (onlyShorts && excludeShorts) {
    ctx.errorHandler.toHttpError(
      new Error("Invalid configuration"),
      "Invalid configuration: cannot set both onlyShorts and excludeShorts",
    );
  }

  try {
    const searchResponse = await ctx.client["GET /search"](
      {
        part: YOUTUBE_PARTS.SNIPPET,
        q,
        maxResults: onlyShorts ? Math.max(maxResults * 2, 50) : maxResults,
        order,
        type: "video",
        pageToken,
        channelId,
        publishedAfter,
        publishedBefore,
        videoCategoryId,
        regionCode,
        relevanceLanguage,
        videoDuration: onlyShorts ? "short" : undefined,
        forMine: ctx.tokens?.access_token && includePrivate ? true : undefined,
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
        `Error searching videos: ${searchResponse.statusText}`,
      );
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: searchData.pageInfo || { totalResults: 0, resultsPerPage: 0 },
        regionCode: searchData.regionCode,
      };
    }

    const videoIds = searchData.items
      // Using any here because the response structure can vary
      // deno-lint-ignore no-explicit-any
      .map((item: any) => {
        if (typeof item.id === "object" && "videoId" in item.id) {
          return item.id.videoId;
        }
        return item.id;
      })
      .join(",");

    const detailsResponse = await ctx.client["GET /videos"](
      {
        part:
          `${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATISTICS},${YOUTUBE_PARTS.STATUS},${YOUTUBE_PARTS.CONTENT_DETAILS}`,
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
        `Error fetching video details: ${detailsResponse.statusText}`,
      );
    }

    const detailsData = await detailsResponse.json();

    // Using any because the video structure is complex and we're adding custom properties
    // deno-lint-ignore no-explicit-any
    let videos = detailsData.items.map((video: any) => {
      const durationInSeconds = calculateDurationInSeconds(
        video.contentDetails?.duration || "PT0S",
      );
      const isShort = durationInSeconds <= 60;

      return {
        ...video,
        isShort,
        durationInSeconds,
      };
    });

    if (onlyShorts) {
      // Using any because we added custom properties to the video objects
      // deno-lint-ignore no-explicit-any
      videos = videos.filter((video: any) => video.isShort);
      if (videos.length > maxResults) {
        videos = videos.slice(0, maxResults);
      }
    } else if (excludeShorts) {
      // Using any because we added custom properties to the video objects
      // deno-lint-ignore no-explicit-any
      videos = videos.filter((video: any) => !video.isShort);
    }

    if (maxDuration) {
      // Using any because we added custom properties to the video objects
      videos = videos.filter(
        // deno-lint-ignore no-explicit-any
        (video: any) => video.durationInSeconds <= maxDuration,
      );
    }

    return {
      kind: detailsData.kind,
      items: videos,
      pageInfo: detailsData.pageInfo,
      nextPageToken: searchData.nextPageToken,
      prevPageToken: searchData.prevPageToken,
      regionCode: searchData.regionCode,
      isAuthenticated: !!ctx.tokens?.access_token,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to search videos",
    );
  }
};

function calculateDurationInSeconds(isoDuration: string): number {
  const match = isoDuration.match(
    /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
  );
  if (!match) return 0;

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  return hours * 3600 + minutes * 60 + seconds;
}

export default loader;
