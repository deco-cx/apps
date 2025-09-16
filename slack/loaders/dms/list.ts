import type { AppContext } from "../../mod.ts";
import { SlackChannel, SlackResponse } from "../../client.ts";

export interface Props {
  /**
   * @description Maximum number of channels to return
   * @default 100
   */
  limit?: number;

  /**
   * @description Pagination cursor for next page
   */
  cursor?: string;
}

/**
 * @name DMS_LIST
 * @title List DM Channels
 * @description Lists all direct message channels for the bot
 */
export default async function listDms(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SlackResponse<{ channels: SlackChannel[] }>> {
  try {
    const limit = props.limit || 100;
    return await ctx.slack.listDmChannels(limit, props.cursor);
  } catch (error) {
    console.error("Error listing DM channels:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: { channels: [] },
    };
  }
}
