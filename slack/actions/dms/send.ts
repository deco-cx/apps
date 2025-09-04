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

/**
 * @description Sends a direct message to a user
 * @action send-dm
 */
export default async function sendDm(
  props: SendDmProps,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string; channelId?: string; ts?: string }> {
  try {
    // Open a DM channel with the user
    const channelResponse = await ctx.slack.openDmChannel(props.userId);

    if (!channelResponse.ok) {
      return {
        success: false,
        message: `Failed to open DM channel: ${channelResponse.error || "Unknown error"}`,
      };
    }

    const channelId = channelResponse.data.channel.id;

    // Send the message to the DM channel
    const messageResponse = await ctx.slack.postMessage(channelId, props.text, {
      blocks: props.blocks,
    });

    if (!messageResponse.ok) {
      return {
        success: false,
        message: "Failed to send DM: Unknown error",
      };
    }

    return {
      success: true,
      message: "DM sent successfully",
      channelId,
      ts: messageResponse.ts,
    };
  } catch (error) {
    console.error("Error sending DM:", error);
    return {
      success: false,
      message: `Error sending DM: ${error.message || "Unknown error"}`,
    };
  }
}
