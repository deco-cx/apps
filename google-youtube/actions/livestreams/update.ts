import type { AppContext } from "../../mod.ts";
import {
  LiveBroadcast,
  LiveBroadcastPrivacyStatus,
} from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Broadcast ID
   * @description ID of the live broadcast
   */
  broadcastId: string;

  /**
   * @title Title
   * @description Title of the live broadcast
   */
  title?: string;

  /**
   * @title Description
   * @description Description of the broadcast
   */
  description?: string;

  /**
   * @title Scheduled Start Time
   * @description Scheduled start date and time
   */
  scheduledStartTime?: string;

  /**
   * @title Scheduled End Time
   * @description Scheduled end date and time
   */
  scheduledEndTime?: string;

  /**
   * @title Privacy Status
   * @description Privacy status of the broadcast
   */
  privacyStatus?: LiveBroadcastPrivacyStatus;

  /**
   * @title Enable DVR
   * @description Enable DVR for later replay
   */
  enableDvr?: boolean;

  /**
   * @title Enable Auto Start
   * @description Enable automatic start when stream begins
   */
  enableAutoStart?: boolean;

  /**
   * @title Enable Auto Stop
   * @description Enable automatic end when stream stops
   */
  enableAutoStop?: boolean;

  /**
   * @title Made For Kids
   * @description Content suitable for children
   */
  madeForKids?: boolean;
}

export interface UpdateLiveBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @name UPDATE_LIVE_BROADCAST
 * @title Update Live Broadcast
 * @description Updates details of a live broadcast on YouTube
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<UpdateLiveBroadcastResult> {
  const {
    broadcastId,
    title,
    description,
    scheduledStartTime,
    scheduledEndTime,
    privacyStatus,
    enableDvr,
    enableAutoStart,
    enableAutoStop,
    madeForKids,
  } = props;

  if (!broadcastId) {
    ctx.errorHandler.toHttpError(
      new Error("Broadcast ID is required"),
      "Broadcast ID is required",
    );
  }

  try {
    const getResponse = await ctx.client["GET /liveBroadcasts"](
      {
        part:
          `id,${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.CONTENT_DETAILS},${YOUTUBE_PARTS.STATUS}`,
        id: broadcastId,
      },
      {
        headers: {
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
      },
    );

    if (!getResponse.ok) {
      ctx.errorHandler.toHttpError(
        getResponse,
        `Failed to get broadcast details: ${getResponse.statusText}`,
      );
    }

    const broadcastData = await getResponse.json();

    if (!broadcastData.items || broadcastData.items.length === 0) {
      ctx.errorHandler.toHttpError(
        new Error("Broadcast not found"),
        "Broadcast not found",
      );
    }

    const broadcast = broadcastData.items[0];

    const payload = {
      id: broadcastId,
      snippet: {
        title: title || broadcast.snippet.title,
        description: description || broadcast.snippet.description,
        scheduledStartTime: scheduledStartTime ||
          broadcast.snippet.scheduledStartTime,
        scheduledEndTime: scheduledEndTime !== undefined
          ? scheduledEndTime
          : broadcast.snippet.scheduledEndTime,
      },
      status: {
        privacyStatus: privacyStatus || broadcast.status.privacyStatus,
        madeForKids: madeForKids !== undefined
          ? madeForKids
          : broadcast.status.madeForKids,
      },
      contentDetails: {
        enableDvr: enableDvr !== undefined
          ? enableDvr
          : broadcast.contentDetails.enableDvr,
        enableAutoStart: enableAutoStart !== undefined
          ? enableAutoStart
          : broadcast.contentDetails.enableAutoStart,
        enableAutoStop: enableAutoStop !== undefined
          ? enableAutoStop
          : broadcast.contentDetails.enableAutoStop,
      },
    };

    const updateResponse = await ctx.client["PUT /liveBroadcasts"](
      {
        part:
          `id,${YOUTUBE_PARTS.SNIPPET},${YOUTUBE_PARTS.CONTENT_DETAILS},${YOUTUBE_PARTS.STATUS}`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
        body: payload,
      },
    );

    if (!updateResponse.ok) {
      ctx.errorHandler.toHttpError(
        updateResponse,
        `Failed to update broadcast: ${updateResponse.statusText}`,
      );
    }

    const updatedBroadcast = await updateResponse.json();

    return {
      success: true,
      message: "Broadcast updated successfully",
      broadcast: updatedBroadcast,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to update broadcast",
    );
  }
}
