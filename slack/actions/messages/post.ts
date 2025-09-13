import type { SlackMessage } from "../../client.ts";
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
): Promise<{
  ok: boolean;
  channel: string;
  ts: string;
  message: SlackMessage;
  warning?: string;
  response_metadata?: {
    warnings?: string[];
  };
  error?: string;
}> {
  const { channelId, text } = props;
  return await ctx.slack.postMessage(channelId, text);
}
