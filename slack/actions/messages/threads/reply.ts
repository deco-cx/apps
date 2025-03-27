import type { AppContext } from "../../../mod.ts";
import type { SlackMessage, SlackResponse } from "../../../client.ts";

export interface Props {
  /**
   * @description The ID of the channel containing the thread
   */
  channelId: string;
  /**
   * @description The timestamp of the parent message to reply to (format: '1234567890.123456')
   */
  threadTs: string;
  /**
   * @description The reply message text
   */
  text: string;
}

/**
 * @name THREADS_REPLY
 * @title Reply to Thread
 * @description Posts a reply message to an existing thread in a Slack channel
 */
export default async function replyToThread(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<
  SlackResponse<{ channel: string; ts: string; message: SlackMessage }>
> {
  const { channelId, threadTs, text } = props;
  return await ctx.slack.postReply(channelId, threadTs, text);
}
