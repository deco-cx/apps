import { AppContext } from "../../mod.ts";
import {
  DEFAULT_MAX_RESULTS,
  YOUTUBE_ERROR_MESSAGES,
  YOUTUBE_PARTS,
} from "../../utils/constant.ts";
import { LiveBroadcastListResponse } from "../../utils/types.ts";

export interface Props {
  /**
   * @title Broadcast ID
   * @description Filter by specific broadcast IDs
   */
  broadcastId?: string;

  /**
   * @title Mine
   * @description Filter broadcasts from the authenticated channel
   */
  mine?: boolean;

  /**
   * @title Channel ID
   * @description Channel ID to fetch broadcasts from (only when mine=false)
   */
  channelId?: string;

  /**
   * @title Broadcast Status
   * @description Lifecycle status of broadcasts to return
   */
  broadcastStatus?: "all" | "active" | "completed" | "upcoming";

  /**
   * @title Max Results
   * @description Maximum number of results to return
   */
  maxResults?: number;

  /**
   * @title Page Token
   * @description Token for the next page of results
   */
  pageToken?: string;

  /**
   * @title Order By
   * @description Sort results by start time or view count
   */
  orderBy?: "startTime" | "viewCount";

  /**
   * @title Include Video Details
   * @description Include video details in the response
   */
  includeVideoDetails?: boolean;
}

/**
 * @name GET_LIVE_BROADCASTS
 * @title List Live Broadcasts
 * @description Retrieves a list of live broadcasts for the authenticated channel or a specific channel
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LiveBroadcastListResponse> => {
  const {
    broadcastId,
    mine: _mine = true,
    channelId,
    broadcastStatus = "active",
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
    orderBy = "startTime",
    includeVideoDetails = false,
  } = props;

  try {
    interface LiveBroadcastParams {
      part: string;
      maxResults: number;
      id?: string;
      channelId?: string;
      broadcastStatus?: "all" | "active" | "completed" | "upcoming";
      mine?: boolean;
      pageToken?: string;
      orderBy?: "startTime" | "viewCount";
    }

    const params: LiveBroadcastParams = {
      part: includeVideoDetails
        ? `${YOUTUBE_PARTS.ID},${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.CONTENT_DETAILS},${YOUTUBE_PARTS.STATUS}`
        : `${YOUTUBE_PARTS.ID},${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.STATUS}`,
      maxResults,
    };

    if (broadcastId) {
      params.id = broadcastId;
    } else if (channelId) {
      params.channelId = channelId;

      if (broadcastStatus === "all") {
        ctx.errorHandler.toHttpError(
          new Error(
            "When using channelId, you must specify a broadcastStatus other than 'all'",
          ),
          "When using channelId, you must specify a broadcastStatus other than 'all'",
        );
      }

      params.broadcastStatus = broadcastStatus;
    } else {
      params.mine = true;
    }

    if (pageToken) {
      params.pageToken = pageToken;
    }

    if (orderBy) {
      params.orderBy = orderBy;
    }

    const response = await ctx.client["GET /liveBroadcasts"](
      params,
      {
        headers: ctx.tokens?.access_token
          ? { Authorization: `Bearer ${ctx.tokens.access_token}` }
          : {},
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        YOUTUBE_ERROR_MESSAGES[response.status.toString()] ||
          `Failed to list broadcasts: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.items) {
      return {
        kind: "youtube#liveBroadcastListResponse",
        etag: "",
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0,
        },
      };
    }

    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process broadcast listing",
    );
  }
};

export default loader;
