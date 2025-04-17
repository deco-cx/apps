import type { AppContext } from "../../mod.ts";
import type { SlackMessage, SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the channel containing the thread
   */
  channelId: string;
  /**
   * @description The timestamp of the parent message (format: '1234567890.123456')
   */
  threadTs: string;
}

/**
 * @name THREAD_REPLIES
 * @title Thread Replies
 * @description Retrieves all replies in a message thread including reactions and metadata
 */
export default async function getThreadReplies(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ messages: SlackMessage[] }>> {
  const { channelId, threadTs } = props;
  return await ctx.slack.getThreadReplies(channelId, threadTs);
}
