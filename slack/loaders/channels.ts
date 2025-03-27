import type { AppContext } from "../mod.ts";
import type { SlackChannel, SlackResponse } from "../client.ts";

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
  const { limit, cursor } = props;
  return await ctx.slack.getChannels(ctx.teamId, limit, cursor);
}
