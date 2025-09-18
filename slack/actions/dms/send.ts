import type { AppContext } from "../../mod.ts";
import { SlackMessage, SlackResponse } from "../../client.ts";

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
 * @name DMS_SEND
 * @title Send DM
 * @description Sends a direct message to a user
 * @action send-dm
 */
export default async function sendDm(
  props: SendDmProps,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{
    channel: string;
    ts: string;
    message: SlackMessage;
    warning?: string;
  }>
> {
  try {
    // First, open/get the DM channel with the user
    const channelResponse = await ctx.slack.openDmChannel(props.userId);

    if (!channelResponse.ok) {
      return {
        ok: false,
        error: channelResponse.error || "Failed to open DM channel",
        data: {
          channel: "",
          ts: "",
          message: {} as SlackMessage,
        },
      };
    }

    const channelId = channelResponse.data.channel?.id;
    if (!channelId) {
      return {
        ok: false,
        error: "No channel ID returned from conversations.open",
        data: {
          channel: "",
          ts: "",
          message: {} as SlackMessage,
        },
      };
    }

    // Now send the message to the DM channel
    return await ctx.slack.postMessage(channelId, props.text, {
      blocks: props.blocks,
    });
  } catch (error) {
    console.error("Error sending DM:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: {
        channel: "",
        ts: "",
        message: {} as SlackMessage,
      },
    };
  }
}
