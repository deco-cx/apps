import type { AppContext } from "../../mod.ts";
import type { SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description The ID of the channel containing the message
   */
  channelId: string;
  /**
   * @description The timestamp of the message to react to
   */
  timestamp: string;
  /**
   * @description The name of the emoji reaction (without ::)
   * @example "thumbsup" for 👍, "heart" for ❤️
   */
  reaction: string;
}

/**
 * @name MESSAGES_REACT
 * @title Add Reaction
 * @description Adds an emoji reaction to a message in a Slack channel
 */
export default async function addReaction(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ channel: string; ts: string }>> {
  const { channelId, timestamp, reaction } = props;
  return await ctx.slack.addReaction(channelId, timestamp, reaction);
}
