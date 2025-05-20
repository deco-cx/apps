import type { AppContext } from "../../mod.ts";
import type { VideoQuery, YoutubeVideoResponse } from "../../utils/types.ts";
import { STALE } from "../../../utils/fetch.ts";

export interface VideoSearchOptions {
  /**
   * @description Search query term for videos
   */
  q: string;

  /**
   * @description Maximum number of results per page
   */
  maxResults?: number;

  /**
   * @description Token for fetching the next page
   */
  pageToken?: string;

  /**
   * @description Video ordering method
   */
  order?: "date" | "rating" | "relevance" | "title" | "viewCount";

  /**
   * @description Channel ID to filter results
   */
  channelId?: string;

  /**
   * @description Minimum publication date (ISO 8601 format)
   */
  publishedAfter?: string;

  /**
   * @description Maximum publication date (ISO 8601 format)
   */
  publishedBefore?: string;

  /**
   * @description Video category ID
   */
  videoCategoryId?: string;

  /**
   * @description Region code for search (ISO 3166-1 alpha-2)
   */
  regionCode?: string;

  /**
   * @description Language code (ISO 639-1)
   */
  relevanceLanguage?: string;

  /**
   * @description Include private videos (when authenticated)
   */
  includePrivate?: boolean;

  /**
   * @description Filter only Shorts videos
   */
  onlyShorts?: boolean;

  /**
   * @description Exclude Shorts from results
   */
  excludeShorts?: boolean;

  /**
   * @description Maximum video duration in seconds
   */
  maxDuration?: number;

  /**
   * @description Skip cache for this request
   */
  skipCache?: boolean;
}

export interface SearchError {
  code: number;
  message: string;
  details?: unknown;
}

interface SearchResponseItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  } | string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    channelTitle?: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
}

interface youtubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  regionCode?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: SearchResponseItem[];
}

interface VideoDetailsWithShorts {
  kind: string;
  etag: string;
  id: string;
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
    tags?: string[];
    categoryId: string;
    liveBroadcastContent?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  contentDetails?: {
    duration: string;
    dimension: string;
    definition: string;
    caption: string;
    licensedContent: boolean;
    projection: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  status?: {
    uploadStatus: string;
    privacyStatus: string;
    license: string;
    embeddable: boolean;
    publicStatsViewable: boolean;
    madeForKids: boolean;
  };
  isShort: boolean;
  durationInSeconds: number;
}

/**
 * @title Search YouTube Videos
 * @description Searches YouTube videos with various filtering criteria, including advanced options for Shorts
 */
export default async function loader(
  props: VideoSearchOptions,
  ctx: AppContext,
): Promise<YoutubeVideoResponse | null> {
  const client = ctx.client;

  const {
    q,
    maxResults = 10,
    pageToken,
    order = "relevance",
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
    return createErrorResponse(400, "Search query is required");
  }

  if (onlyShorts && excludeShorts) {
    return createErrorResponse(
      400,
      "Invalid configuration: cannot set both onlyShorts and excludeShorts",
    );
  }

  try {
    const searchParams: VideoQuery = {
      part: "snippet",
      q,
      maxResults: onlyShorts ? Math.max(maxResults * 2, 50) : maxResults,
      order,
      type: "video",
    };

    if (pageToken) searchParams.pageToken = pageToken;
    if (channelId) searchParams.channelId = channelId;
    if (publishedAfter) searchParams.publishedAfter = publishedAfter;
    if (publishedBefore) searchParams.publishedBefore = publishedBefore;
    if (videoCategoryId) searchParams.videoCategoryId = videoCategoryId;
    if (regionCode) searchParams.regionCode = regionCode;
    if (relevanceLanguage) searchParams.relevanceLanguage = relevanceLanguage;
    if (onlyShorts) searchParams.videoDuration = "short";
    if (ctx.access_token && includePrivate) searchParams.forMine = true;

    const requestOptions = ctx.access_token
      ? {
        headers: { Authorization: `Bearer ${ctx.access_token}` },
        ...STALE,
      }
      : { ...STALE };

    const searchResponse = await client["GET /search"](
      searchParams,
      requestOptions,
    );

    if (searchResponse.status === 401) {
      ctx.response.headers.set("X-Token-Expired", "true");
      ctx.response.headers.set("Cache-Control", "no-store");
      return createErrorResponse(
        401,
        "Authentication token expired or invalid",
      );
    }

    if (!searchResponse.ok) {
      return createErrorResponse(
        searchResponse.status,
        `Error searching videos: ${searchResponse.status}`,
        await searchResponse.text(),
      );
    }

    const searchData = await searchResponse.json() as youtubeSearchResponse;

    if (!searchData.items || searchData.items.length === 0) {
      return {
        kind: "youtube#videoListResponse",
        items: [],
        pageInfo: searchData.pageInfo || { totalResults: 0, resultsPerPage: 0 },
        regionCode: searchData.regionCode,
      };
    }

    const videoIds = searchData.items
      .map((item) => {
        if (typeof item.id === "object" && "videoId" in item.id) {
          return item.id.videoId;
        }
        return null;
      })
      .filter((id): id is string => id !== null)
      .join(",");

    const detailsParams = {
      part: "snippet,statistics,status,contentDetails",
      id: videoIds,
    };

    const detailsResponse = await client["GET /videos"](
      detailsParams,
      requestOptions,
    );

    if (!detailsResponse.ok) {
      return createErrorResponse(
        detailsResponse.status,
        `Error fetching video details: ${detailsResponse.status}`,
        await detailsResponse.text(),
      );
    }

    const detailsData = await detailsResponse.json() as {
      items: Array<
        Omit<VideoDetailsWithShorts, "isShort" | "durationInSeconds">
      >;
    };

    let items: VideoDetailsWithShorts[] = [];

    if (detailsData.items && detailsData.items.length > 0) {
      items = detailsData.items.map((item) => {
        const duration = item.contentDetails?.duration || "PT0S";
        const durationInSeconds = calculateDurationInSeconds(duration);
        const isShort = durationInSeconds <= 60;

        return {
          ...item,
          isShort,
          durationInSeconds,
        };
      });

      if (onlyShorts) {
        items = items.filter((item) => item.isShort).slice(0, maxResults);
      } else if (excludeShorts) {
        items = items.filter((item) => !item.isShort);
      }

      if (maxDuration) {
        items = items.filter((item) => item.durationInSeconds <= maxDuration);
      }
    }

    return {
      kind: "youtube#videoListResponse",
      items,
      nextPageToken: searchData.nextPageToken,
      prevPageToken: searchData.prevPageToken,
      pageInfo: {
        totalResults: items.length,
        resultsPerPage: items.length,
      },
      regionCode: searchData.regionCode,
      isAuthenticated: !!ctx.access_token,
    };
  } catch (error) {
    return createErrorResponse(
      500,
      "Error processing video search",
      error instanceof Error ? error.message : String(error),
    );
  }
}

function calculateDurationInSeconds(isoDuration: string): number {
  const duration = isoDuration.substring(2);
  let seconds = 0, minutes = 0, hours = 0;

  const hoursMatch = duration.match(/(\d+)H/);
  if (hoursMatch) hours = parseInt(hoursMatch[1], 10);

  const minutesMatch = duration.match(/(\d+)M/);
  if (minutesMatch) minutes = parseInt(minutesMatch[1], 10);

  const secondsMatch = duration.match(/(\d+)S/);
  if (secondsMatch) seconds = parseInt(secondsMatch[1], 10);

  return hours * 3600 + minutes * 60 + seconds;
}

function createErrorResponse(
  code: number,
  message: string,
  details?: unknown,
): YoutubeVideoResponse {
  return {
    kind: "youtube#videoListResponse",
    items: [],
    pageInfo: { totalResults: 0, resultsPerPage: 0 },
    error: { code, message, details },
  } as YoutubeVideoResponse;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: VideoSearchOptions, req: Request) => {
  const tokenExpired = req.headers.get("X-Token-Expired") === "true";

  if (props.includePrivate || props.skipCache || tokenExpired) {
    return null;
  }

  const tokenFragment = "";

  const params = new URLSearchParams([
    ["q", props.q || ""],
    ["maxResults", (props.maxResults || 10).toString()],
    ["pageToken", props.pageToken || ""],
    ["order", props.order || "relevance"],
    ["channelId", props.channelId || ""],
    ["publishedAfter", props.publishedAfter || ""],
    ["publishedBefore", props.publishedBefore || ""],
    ["videoCategoryId", props.videoCategoryId || ""],
    ["regionCode", props.regionCode || ""],
    ["relevanceLanguage", props.relevanceLanguage || ""],
    ["onlyShorts", (props.onlyShorts || false).toString()],
    ["excludeShorts", (props.excludeShorts || false).toString()],
    ["maxDuration", props.maxDuration?.toString() || ""],
    ["tokenId", tokenFragment],
  ]);

  params.sort();
  return `youtube-search-${params.toString()}`;
};
