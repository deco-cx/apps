import type { AppContext } from "../../mod.ts";
import { LiveBroadcast } from "../../utils/types.ts";
import { YOUTUBE_PARTS } from "../../utils/constant.ts";

export type BroadcastTransitionType =
  | "testing" // Puts the broadcast in test mode
  | "live" // Starts the broadcast live for everyone
  | "complete"; // Ends the broadcast

export interface Props {
  /**
   * @title Broadcast ID
   * @description ID of the live broadcast
   */
  broadcastId: string;

  /**
   * @title Transition Type
   * @description Type of transition to apply
   */
  transitionType: BroadcastTransitionType;
}

export interface TransitionBroadcastResult {
  success: boolean;
  message: string;
  broadcast?: LiveBroadcast;
  error?: unknown;
}

/**
 * @name TRANSITION_BROADCAST
 * @title Change Broadcast Status
 * @description Changes the status of a live broadcast (start test, go live, end)
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TransitionBroadcastResult> {
  const {
    broadcastId,
    transitionType,
  } = props;

  if (!broadcastId) {
    ctx.errorHandler.toHttpError(
      new Error("Broadcast ID is required"),
      "Broadcast ID is required",
    );
  }

  if (!["testing", "live", "complete"].includes(transitionType)) {
    ctx.errorHandler.toHttpError(
      new Error(
        "Invalid transition type. Use 'testing', 'live', or 'complete'",
      ),
      "Invalid transition type. Use 'testing', 'live', or 'complete'",
    );
  }

  try {
    const response = await ctx.client["POST /liveBroadcasts/transition"](
      {
        id: broadcastId,
        broadcastStatus: transitionType,
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
      let errorMessage =
        `Failed to change status to ${transitionType}: ${response.statusText}`;

      if (transitionType === "testing" && response.status === 400) {
        errorMessage =
          "Failed to start test: verify that the broadcast is in 'ready' state and linked to a stream.";
      } else if (transitionType === "live" && response.status === 400) {
        errorMessage =
          "Failed to go live: verify that the broadcast is in 'testing' state and that streaming is active.";
      } else if (transitionType === "complete" && response.status === 400) {
        errorMessage =
          "Failed to end: verify that the broadcast is in 'live' or 'testing' state.";
      }

      ctx.errorHandler.toHttpError(
        response,
        errorMessage,
      );
    }

    const broadcast = await response.json();

    let successMessage = "";
    if (transitionType === "testing") {
      successMessage = "Broadcast successfully put in test mode";
    } else if (transitionType === "live") {
      successMessage = "Broadcast successfully started live";
    } else if (transitionType === "complete") {
      successMessage = "Broadcast successfully ended";
    }

    return {
      success: true,
      message: successMessage,
      broadcast,
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to transition broadcast",
    );
  }
}
