import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description Discord channel ID to get information from
   */
  channelId: string;
}

/**
 * @title Get Channel Information
 * @description Get detailed information about a specific Discord channel
 */
export default async function getChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const { channelId } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Get channel information
  const response = await client["GET /channels/:channel_id"]({
    channel_id: channelId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get channel information: ${response.statusText}`,
    );
  }

  const channel = await response.json();
  return channel;
} 