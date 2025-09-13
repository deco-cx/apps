import type { AppContext } from "../../mod.ts";
import { SlackMessage } from "../../client.ts";

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
 * @description Lists messages in a direct message conversation with a user
 */
export default async function dmHistory(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackMessage[]> {
  try {
    const channelResponse = await ctx.slack.openDmChannel(props.userId);

    if (!channelResponse.ok) {
      console.error("Failed to open DM channel:", channelResponse.error);
      return [];
    }

    const channelId = channelResponse.channel?.id;
    if (!channelId) {
      console.error("No channel ID returned for user", props.userId);
      return [];
    }
    const limit = props.limit || 10;

    const historyResponse = await ctx.slack.getChannelHistory(channelId, limit, props.cursor);

    if (!historyResponse.ok) {
      console.error("Failed to get DM history:", historyResponse.error);
      return [];
    }

    return historyResponse.data.messages || [];
  } catch (error) {
    console.error("Error getting DM history:", error);
    return [];
  }
}
