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
    // First open or get the DM channel with the user
    const channelResponse = await ctx.slack.openDmChannel(props.userId);

    if (!channelResponse.ok) {
      console.error("Failed to open DM channel:", channelResponse.error);
      return [];
    }

    const channelId = channelResponse.data.channel.id;
    const limit = props.limit || 10;

    // Get the history of this DM channel
    const historyResponse = await ctx.slack.getChannelHistory(channelId, limit);

    if (!historyResponse.ok) {
      console.error("Failed to get DM history:", historyResponse.error);
      return [];
    }

    return historyResponse.data.messages;
  } catch (error) {
    console.error("Error getting DM history:", error);
    return [];
  }
}
