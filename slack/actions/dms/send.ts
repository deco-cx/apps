import type { AppContext } from "../../mod.ts";

export interface SendDmProps {
  /**
   * @description The ID of the user to send the DM to
   */
  userId: string;

  /**
   * @description The message text to send
   */
  text: string;

  /**
   * @description Optional blocks for Block Kit formatting
   */
  blocks?: unknown[];
}

export interface SendDmResponse {
  success: boolean;
  message: string;
  channelId?: string;
  ts?: string;
  messageData?: {
    ok: boolean;
    channel: string;
    ts: string;
    warning?: string;
    response_metadata?: {
      warnings?: string[];
    };
  };
}

/**
 * @name DMS_SEND
 * @title Send DM
 * @description Sends a direct message to a user
 * @action send-dm
 */
export default async function sendDm(
  props: SendDmProps,
  _req: Request,
  ctx: AppContext,
): Promise<SendDmResponse> {
  try {
    // Send message directly to the user ID (Slack automatically opens DM channel)
    const messageResponse = await ctx.slack.postMessage(props.userId, props.text, {
      blocks: props.blocks,
    });

    if (!messageResponse.ok) {
      return {
        success: false,
        message: `Failed to send DM: ${messageResponse.error || "Unknown error"}`,
      };
    }

    return {
      success: true,
      message: "DM sent successfully",
      channelId: messageResponse.data.channel,
      ts: messageResponse.data.ts,
      messageData: {
        ok: messageResponse.ok,
        channel: messageResponse.data.channel,
        ts: messageResponse.data.ts,
        warning: messageResponse.data.warning,
        response_metadata: messageResponse.response_metadata,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error sending DM:", error);
    return {
      success: false,
      message: `Error sending DM: ${message}`,
    };
  }
}
