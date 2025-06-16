import { AppContext } from "../../mod.ts";
import { YoutubeChannelResponse } from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Get My Channel
   * @description Fetch the authenticated user's channel information
   */
  mine?: boolean;

  /**
   * @title Part
   * @description Additional parts to include in the response (snippet, contentDetails, statistics, status)
   */
  part?: string;

  /**
   * @title Channel ID
   * @description Specific channel ID to fetch
   */
  id?: string;
}

/**
 * @name GET_YOUTUBE_CHANNELS
 * @title Get YouTube Channels
 * @description Retrieves information about YouTube channels for the authenticated user or by specific ID
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<YoutubeChannelResponse> => {
  const { client } = ctx;

  const {
    part = YOUTUBE_PARTS.SNIPPET,
    id,
    mine = true,
  } = props;

  if (!id && !mine) {
    ctx.errorHandler.toHttpError(
      new Error("Channel ID is required or mine must be true"),
      "Channel ID is required or mine must be true",
    );
  }

  try {
    const response = await client["GET /channels"]({ part, id, mine });

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to fetch channel data: ${response.statusText}`,
      );
    }

    const channelData = await response.json();
    return channelData;
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to fetch channel information",
    );
  }
};

export default loader;
