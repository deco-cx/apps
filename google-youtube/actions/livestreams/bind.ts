import { LiveBroadcast } from "../../utils/types.ts";
import type { AppContext } from "../../mod.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Broadcast ID
   * @description ID of the live broadcast
   */
  broadcastId: string;

  /**
   * @title Stream ID
   * @description ID of the video stream
   */
  streamId: string;
}

export interface BindStreamResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @name BIND_STREAM_TO_BROADCAST
 * @title Bind Stream to Broadcast
 * @description Links a video stream to a live broadcast
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BindStreamResult> {
  const {
    broadcastId,
    streamId,
  } = props;

  if (!broadcastId) {
    ctx.errorHandler.toHttpError(
      new Error("Broadcast ID is required"),
      "Broadcast ID is required",
    );
  }

  if (!streamId) {
    ctx.errorHandler.toHttpError(
      new Error("Stream ID is required"),
      "Stream ID is required",
    );
  }

  try {
    const response = await ctx.client["POST /liveBroadcasts/bind"](
      {
        id: broadcastId,
        streamId: streamId,
        part:
          `id,${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.CONTENT_DETAILS},${YOUTUBE_PARTS.STATUS}`,
      },
      {
        headers: {
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
          "Content-Length": "0",
        },
      },
    );

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to bind stream: ${response.statusText}`,
      );
    }

    const broadcast = await response.json();

    return {
      success: true,
      message: "Stream successfully bound to broadcast",
      broadcast,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to bind stream to broadcast",
    );
  }
}
