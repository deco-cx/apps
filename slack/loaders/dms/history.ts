import type { AppContext } from "../../mod.ts";
import { SlackMessage, SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the user whose DMs to list
   */
  userId: string;

  /**
   * @description Maximum number of messages to return
   * @default 10
   */
  limit?: number;

  /**
   * @description Pagination cursor for next page
   */
  cursor?: string;
}

/**
 * @name DMS_HISTORY
 * @title DM Conversation History
 * @description Lists messages in a direct message conversation with a user
 */
export default async function dmHistory(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{
    messages: SlackMessage[];
    has_more?: boolean;
    pin_count?: number;
    channel_actions_ts?: string | null;
    channel_actions_count?: number;
    warning?: string;
  }>
> {
  try {
    const channelResponse = await ctx.slack.openDmChannel(props.userId);

    if (!channelResponse.ok) {
      console.error("Failed to open DM channel:", channelResponse.error);
      return {
        ok: false,
        error: channelResponse.error || "Failed to open DM channel",
        data: { messages: [] },
      };
    }

    const channelId = channelResponse.data.channel?.id;
    if (!channelId) {
      console.error("No channel ID returned for user", props.userId);
      return {
        ok: false,
        error: "No channel ID returned",
        data: { messages: [] },
      };
    }
    const limit = props.limit || 10;

    return await ctx.slack.getChannelHistory(
      channelId,
      limit,
      props.cursor,
    );
  } catch (error) {
    console.error("Error getting DM history:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: { messages: [] },
    };
  }
}
