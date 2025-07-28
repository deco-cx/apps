import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID of the channel to delete
   */
  channelId: string;

  /**
   * @title Reason
   * @description Reason for deleting the channel (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Delete Channel
 * @description Delete a Discord channel permanently (requires Manage Channels permission)
 */
export default async function deleteChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const { channelId, reason } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Delete channel
  const response = await client["DELETE /channels/:channel_id"]({
    channel_id: channelId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to delete channel: ${response.statusText}`,
    );
  }

  const channel = await response.json();
  return channel;
} 