import type { AppContext } from "../../mod.ts";
import type { SlackMessage, SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the channel to fetch history from
   */
  channelId: string;
  /**
   * @description Maximum number of messages to return
   * @default 10
   */
  limit?: number;
}

/**
 * @name CHANNELS_HISTORY
 * @title Channel History
 * @description Retrieves recent messages from a Slack channel including reactions and thread information
 */
export default async function getChannelHistory(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ messages: SlackMessage[] }>> {
  const { channelId, limit } = props;
  return await ctx.slack.getChannelHistory(channelId, limit);
}
