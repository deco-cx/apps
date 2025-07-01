import type { ChannelType, SlackChannel } from "../client.ts";
import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @description Maximum number of channels to return (default 100, max 200)
   * @default 100
   */
  limit?: number;
  /**
   * @description Pagination cursor for next page of results
   */
  cursor?: string;
  /**
   * @description Types of channels to return
   * @default ["public_channel"]
   */
  types?: ChannelType[];
}

/**
 * @name LIST_CHANNELS
 * @title List Channels
 * @description Lists all public channels in the workspace with pagination
 */
export default async function listChannels(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ channels: SlackChannel[] }> {
  const { limit, cursor, types } = props;
  const teamId = ctx.teamId;

  if (!teamId) {
    throw new Error(
      "Team ID is required. Please configure the Slack app with a valid team ID.",
    );
  }

  return await ctx.slack.getChannels(teamId, limit, cursor, types);
}
