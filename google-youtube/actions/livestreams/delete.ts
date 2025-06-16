import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @title Broadcast ID
   * @description ID of the live broadcast to be deleted
   */
  broadcastId: string;
}

export interface DeleteLiveBroadcastResult {
  success: boolean;
  message: string;
  error?: unknown;
}

/**
 * @name DELETE_LIVE_BROADCAST
 * @title Delete Live Broadcast
 * @description Removes a live broadcast from YouTube
 */
export default async function action(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DeleteLiveBroadcastResult> {
  const {
    broadcastId,
  } = props;

  if (!broadcastId) {
    ctx.errorHandler.toHttpError(
      new Error("Broadcast ID is required"),
      "Broadcast ID is required",
    );
  }

  try {
    const response = await ctx.client["DELETE /liveBroadcasts"](
      {
        id: broadcastId,
      },
      {
        headers: {
          Authorization: `Bearer ${ctx.tokens?.access_token}`,
        },
      },
    );

    if (response.status === 204) {
      return {
        success: true,
        message: "Broadcast deleted successfully",
      };
    }

    if (!response.ok) {
      ctx.errorHandler.toHttpError(
        response,
        `Failed to delete broadcast: ${response.statusText}`,
      );
    }

    return {
      success: true,
      message: "Broadcast deleted successfully",
    };
  } catch (error) {
    ctx.errorHandler.toHttpError(
      error,
      "Failed to delete broadcast",
    );
  }
}
