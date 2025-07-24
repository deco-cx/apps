import type { AppContext } from "../../mod.ts";
import {
  LiveBroadcast,
  LiveBroadcastPrivacyStatus,
} from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export interface Props {
  /**
   * @title Title
   * @description Title of the live broadcast
   */
  title: string;

  /**
   * @title Description
   * @description Description of the live broadcast
   */
  description?: string;

  /**
   * @title Scheduled Start Time
   * @description Scheduled start date and time (ISO 8601 format)
   */
  scheduledStartTime: string;

  /**
   * @title Scheduled End Time
   * @description Scheduled end date and time (ISO 8601 format)
   */
  scheduledEndTime?: string;

  /**
   * @title Privacy Status
   * @description Privacy status of the broadcast
   */
  privacyStatus?: LiveBroadcastPrivacyStatus;

  /**
   * @title Enable DVR
   * @description Enable DVR (allows viewers to rewind during the broadcast)
   */
  enableDvr?: boolean;

  /**
   * @title Enable Auto Start
   * @description Enable automatic start when the broadcast is ready
   */
  enableAutoStart?: boolean;

  /**
   * @title Enable Auto Stop
   * @description Enable automatic stop when the broadcast ends
   */
  enableAutoStop?: boolean;

  /**
   * @title Made For Kids
   * @description Broadcast is suitable for children
   */
  madeForKids?: boolean;
}

export interface CreateLiveBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @name CREATE_LIVE_BROADCAST
 * @title Create Live Broadcast
 * @description Creates a new live broadcast on YouTube
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<CreateLiveBroadcastResult> {
  const {
    title,
    description = "",
    scheduledStartTime,
    scheduledEndTime,
    privacyStatus = "private",
    enableDvr = true,
    enableAutoStart = false,
    enableAutoStop = false,
    madeForKids = false,
  } = props;

  if (!title) {
    ctx.errorHandler.toHttpError(
      new Error("Title is required"),
      "Title is required",
    );
  }

  if (!scheduledStartTime) {
    ctx.errorHandler.toHttpError(
      new Error("Scheduled start time is required"),
      "Scheduled start time is required",
    );
  }

  try {
    const startTime = new Date(scheduledStartTime);
    const now = new Date();

    if (startTime < now) {
      ctx.errorHandler.toHttpError(
        new Error("Start time must be in the future"),
        "Start time must be in the future",
      );
    }

    if (scheduledEndTime) {
      const endTime = new Date(scheduledEndTime);
      if (endTime <= startTime) {
        ctx.errorHandler.toHttpError(
          new Error("End time must be after start time"),
          "End time must be after start time",
        );
      }
    }

    const payload = {
      snippet: {
        title,
        description,
        scheduledStartTime,
        scheduledEndTime,
      },
      status: {
        privacyStatus,
        selfDeclaredMadeForKids: madeForKids,
      },
      contentDetails: {
        enableDvr,
        enableAutoStart,
        enableAutoStop,
        enableEmbed: true,
        recordFromStart: true,
        startWithSlate: false,
      },
    };

    const response = await ctx.client["POST /liveBroadcasts"](
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

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to create broadcast: ${response.statusText}`,
      );
    }

    const broadcast = await response.json();

    return {
      success: true,
      message: "Broadcast created successfully",
      broadcast,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to create broadcast",
    );
  }
}
