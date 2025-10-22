import type { SlackMessage, SlackResponse } from "../../client.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description The ID of the channel to post to
   */
  channelId: string;
  /**
   * @description The message text to post
   */
  text: string;
  /**
   * @description Thread timestamp to reply to a specific thread
   */
  thread_ts?: string;
  /**
   * @description Blocks for rich formatting (Block Kit)
   */
  blocks?: unknown[];
}

/**
 * @name MESSAGES_POST
 * @title Post Message
 * @description Posts a new message to a Slack channel and returns the message details
 */
export default async function postMessage(
  props: Props,
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
  const { channelId, text, thread_ts, blocks } = props;
  
  // Use channel-specific Slack client to get the right bot configuration
  const slackClient = ctx.slackClientForChannel(channelId);
  
  return await slackClient.postMessage(channelId, text, { thread_ts, blocks });
}
