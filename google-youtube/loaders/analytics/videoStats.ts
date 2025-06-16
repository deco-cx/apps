import { AppContext } from "../../mod.ts";
import {
  COMMON_ERROR_MESSAGES,
  DEFAULT_MAX_RESULTS,
} from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Channel ID in format "channel==CHANNEL_ID"
   */
  channelId: string;

  /**
   * @title Video ID
   * @description Video ID or comma-separated video IDs to filter (optional)
   */
  videoId?: string;

  /**
   * @title Start Date
   * @description Query start date in YYYY-MM-DD format
   */
  startDate: string;

  /**
   * @title End Date
   * @description Query end date in YYYY-MM-DD format
   */
  endDate: string;

  /**
   * @title Metrics
   * @description Comma-separated metrics to fetch (views, estimatedMinutesWatched, averageViewDuration, averageViewPercentage, likes, comments, shares)
   */
  metrics?: string;

  /**
   * @title Dimensions
   * @description Comma-separated dimensions to group data (use "video" to separate by video)
   */
  dimensions?: string;

  /**
   * @title Sort
   * @description Field to sort results by (ex: -views for most views first)
   */
  sort?: string;

  /**
   * @title Max Results
   * @description Maximum number of results to return
   */
  maxResults?: number;
}

interface AnalyticsResult {
  kind: string;
  columnHeaders: Array<{
    name: string;
    columnType: string;
    dataType: string;
  }>;
  rows: Array<Array<string | number>>;
  videoData?: Array<{
    videoId: string;
    title?: string;
    metrics: Record<string, number>;
  }>;
}

/**
 * @name GET_VIDEO_ANALYTICS
 * @title Get Video Analytics
 * @description Fetches analytical data for specific videos using the YouTube Analytics API
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AnalyticsResult> => {
  const {
    channelId,
    videoId,
    startDate,
    endDate,
    metrics =
      "views,estimatedMinutesWatched,likes,comments,shares,averageViewDuration",
    dimensions = "video",
    sort = "-views",
    maxResults = DEFAULT_MAX_RESULTS,
  } = props;

  if (!channelId) {
    ctx.errorHandler.toHttpError(
      new Error(COMMON_ERROR_MESSAGES.MISSING_CHANNEL_ID),
      COMMON_ERROR_MESSAGES.MISSING_CHANNEL_ID,
    );
  }

  if (!startDate || !endDate) {
    ctx.errorHandler.toHttpError(
      new Error("Start date and end date are required"),
      "Start date and end date are required",
    );
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
    ctx.errorHandler.toHttpError(
      new Error("Dates must be in YYYY-MM-DD format"),
      "Dates must be in YYYY-MM-DD format",
    );
  }

  try {
    const params = new URLSearchParams({
      ids: channelId,
      startDate,
      endDate,
      metrics,
      dimensions,
      sort,
      maxResults: maxResults.toString(),
    });

    if (videoId) {
      params.append("filters", `video==${videoId}`);
    }

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to fetch video analytics: ${response.statusText}`,
      );
    }

    const analyticsData = await response.json();

    const result: AnalyticsResult = {
      kind: analyticsData.kind,
      columnHeaders: analyticsData.columnHeaders || [],
      rows: analyticsData.rows || [],
    };

    if (dimensions.includes("video") && result.rows.length > 0) {
      const videoData = [];
      const headerIndexMap: Record<string, number> = {};

      result.columnHeaders.forEach((header, index) => {
        headerIndexMap[header.name] = index;
      });

      for (const row of result.rows) {
        const videoObject: {
          videoId: string;
          metrics: Record<string, number>;
        } = {
          videoId: String(row[headerIndexMap["video"]]),
          metrics: {},
        };

        for (const header of result.columnHeaders) {
          if (header.name !== "video") {
            videoObject.metrics[header.name] =
              row[headerIndexMap[header.name]] as number;
          }
        }

        videoData.push(videoObject);
      }

      result.videoData = videoData;
    }

    return result;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to fetch video analytics data",
    );
  }
};

export default loader;
