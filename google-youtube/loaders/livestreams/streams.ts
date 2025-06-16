import { AppContext } from "../../mod.ts";
import { LiveStreamListResponse } from "../../utils/types.ts";
import {
  COMMON_ERROR_MESSAGES,
  DEFAULT_MAX_RESULTS,
  YOUTUBE_ERROR_MESSAGES,
  YOUTUBE_PARTS,
} from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Stream ID
   * @description Filter by specific stream IDs
   */
  streamId?: string;

  /**
   * @title Mine
   * @description Filter streams from the authenticated channel
   */
  mine?: boolean;

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
}

/**
 * @name GET_LIVE_STREAMS
 * @title List Live Streams
 * @description Retrieves a list of video stream resources for the authenticated channel
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<LiveStreamListResponse> => {
  const {
    streamId,
    mine = true,
    maxResults = DEFAULT_MAX_RESULTS,
    pageToken,
  } = props;

  try {
    interface LiveStreamParams {
      part: string;
      maxResults: number;
      id?: string;
      mine?: boolean;
      pageToken?: string;
    }

    const params: LiveStreamParams = {
      part:
        `${YOUTUBE_PARTS.ID},${YOUTUBE_PARTS.SNIPPET},cdn,${YOUTUBE_PARTS.STATUS},${YOUTUBE_PARTS.CONTENT_DETAILS}`,
      maxResults,
    };

    if (streamId) {
      params.id = streamId;
    } else if (mine) {
      params.mine = true;
    } else {
      ctx.errorHandler.toHttpError(
        new Error(COMMON_ERROR_MESSAGES.INVALID_PARAMETERS),
        "Invalid parameters: either streamId or mine must be specified",
      );
    }

    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await ctx.client["GET /liveStreams"](
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
          `Failed to list streams: ${response.statusText}`,
      );
    }

    const data = await response.json();

    if (!data.items) {
      return {
        kind: "youtube#liveStreamListResponse",
        etag: "",
        items: [],
        pageInfo: {
          totalResults: 0,
          resultsPerPage: 0,
        },
      };
    }

    if (data.items.length === 0) {
      return {
        kind: "youtube#liveStreamListResponse",
        etag: data.etag || "",
        items: [],
        pageInfo: data.pageInfo || {
          totalResults: 0,
          resultsPerPage: 0,
        },
        infoMessage:
          "No video streams found. For live broadcasts, you need to first set up a video stream on the channel.",
      };
    }

    return data;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to process stream listing",
    );
  }
};

export default loader;
