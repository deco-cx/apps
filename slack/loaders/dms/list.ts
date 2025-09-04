import type { AppContext } from "../../mod.ts";
import { SlackChannel } from "../../client.ts";

export interface Props {
  /**
   * @description Maximum number of DM channels to return
   * @default 100
   */
  limit?: number;

  /**
   * @description Pagination cursor for next page
   */
  cursor?: string;
}

/**
 * @description Lists all direct message channels for the bot
 */
export default async function listDms(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ channels: SlackChannel[]; next_cursor?: string }> {
  try {
    const limit = props.limit || 100;
    const dmResponse = await ctx.slack.listDmChannels(limit, props.cursor);

    if (!dmResponse.ok) {
      console.error("Failed to list DM channels:", dmResponse.error);
      return { channels: [] };
    }

    return {
      channels: dmResponse.data.channels,
      next_cursor: dmResponse.response_metadata?.next_cursor,
    };
  } catch (error) {
    console.error("Error listing DM channels:", error);
    return { channels: [] };
  }
}
