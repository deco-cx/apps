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
   * @description Comma-separated metrics to fetch (views, estimatedMinutesWatched, likes, subscribersGained, shares, comments, averageViewDuration)
   */
  metrics?: string;

  /**
   * @title Dimensions
   * @description Comma-separated dimensions to group data (day, month, video, country, subscribedStatus)
   */
  dimensions?: string;

  /**
   * @title Sort
   * @description Field to sort results by (ex: day, -views for descending order)
   */
  sort?: string;

  /**
   * @title Filters
   * @description Additional filters for the query
   */
  filters?: string;

  /**
   * @title Max Results
   * @description Maximum number of results to return
   */
  maxResults?: number;
}

interface AnalyticsResponse {
  kind: string;
  columnHeaders: Array<{
    name: string;
    columnType: string;
    dataType: string;
  }>;
  rows: Array<Array<string | number>>;
}

/**
 * @name GET_CHANNEL_ANALYTICS
 * @title Get Channel Analytics
 * @description Fetches analytical data for a YouTube channel using the YouTube Analytics API
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AnalyticsResponse> => {
  const {
    channelId,
    startDate,
    endDate,
    metrics = "views,estimatedMinutesWatched,subscribersGained",
    dimensions = "day",
    sort = "day",
    filters,
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

    if (filters) {
      params.append("filters", filters);
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
        `Failed to fetch channel analytics: ${response.statusText}`,
      );
    }

    const analyticsData = await response.json();

    return {
      kind: analyticsData.kind,
      columnHeaders: analyticsData.columnHeaders,
      rows: analyticsData.rows || [],
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to fetch channel analytics data",
    );
  }
};

export default loader;
