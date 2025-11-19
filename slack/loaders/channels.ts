import type { ChannelType, SlackChannel, SlackResponse } from "../client.ts";
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
): Promise<SlackResponse<{ channels: SlackChannel[] }>> {
  const { limit = 100, cursor, types } = props;
  const teamId = ctx.teamId;

  if (!teamId) {
    throw new Error(
      "Team ID is required. Please configure the Slack app with a valid team ID.",
    );
  }

  if (!limit) {
    // fetch all channels in loop
    const allChannels: SlackChannel[] = [];
    let nextCursor = cursor;
    while (true) {
      try {
        const response = await ctx.slack.getChannels(
          teamId,
          limit,
          nextCursor,
          types,
        );

        if (!response.ok) {
          return {
            ok: false,
            error: response.error || "Failed to fetch channels",
            data: { channels: [] },
          };
        }

        allChannels.push(...response.data.channels);
        nextCursor = response.response_metadata?.next_cursor;
        if (!nextCursor || response.data.channels.length === 0) {
          break;
        }
      } catch (error) {
        return {
          ok: false,
          error: error instanceof Error ? error.message : "Unknown error",
          data: { channels: [] },
        };
      }
    }
    return {
      ok: true,
      data: { channels: allChannels },
    };
  }

  return await ctx.slack.getChannels(teamId, limit, cursor, types);
}
