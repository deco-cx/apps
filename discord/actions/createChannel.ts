import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to create the channel
   */
  guildId: string;

  /**
   * @title Channel Name
   * @description Name of the channel to create (2-100 characters)
   */
  name: string;

  /**
   * @title Channel Type
   * @description Type of channel to create
   * @default 0
   */
  type?: 0 | 2 | 4 | 5 | 10 | 11 | 12 | 13 | 15;

  /**
   * @title Topic
   * @description Channel topic (0-1024 characters, text channels only)
   */
  topic?: string;

  /**
   * @title Bitrate
   * @description Voice channel bitrate (8000-96000, voice channels only)
   */
  bitrate?: number;

  /**
   * @title User Limit
   * @description Voice channel user limit (0-99, voice channels only)
   */
  userLimit?: number;

  /**
   * @title Rate Limit Per User
   * @description Seconds a user has to wait before sending another message (0-21600)
   */
  rateLimitPerUser?: number;

  /**
   * @title Position
   * @description Sorting position of the channel
   */
  position?: number;

  /**
   * @title Parent ID
   * @description ID of the parent category for this channel
   */
  parentId?: string;

  /**
   * @title NSFW
   * @description Whether the channel is NSFW
   * @default false
   */
  nsfw?: boolean;

  /**
   * @title Reason
   * @description Reason for creating the channel (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Create Channel
 * @description Create a new channel in a Discord guild
 */
export default async function createChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const {
    guildId,
    name,
    type = 0,
    topic,
    bitrate,
    userLimit,
    rateLimitPerUser,
    position,
    parentId,
    nsfw = false,
    reason,
  } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!name) {
    throw new Error("Channel name is required");
  }

  if (name.length < 2 || name.length > 100) {
    throw new Error("Channel name must be between 2 and 100 characters");
  }

  // Build request body
  const body: any = {
    name,
    type,
    nsfw,
  };

  if (topic) {
    if (topic.length > 1024) {
      throw new Error("Channel topic cannot exceed 1024 characters");
    }
    body.topic = topic;
  }

  if (bitrate !== undefined) {
    if (bitrate < 8000 || bitrate > 96000) {
      throw new Error("Bitrate must be between 8000 and 96000");
    }
    body.bitrate = bitrate;
  }

  if (userLimit !== undefined) {
    if (userLimit < 0 || userLimit > 99) {
      throw new Error("User limit must be between 0 and 99");
    }
    body.user_limit = userLimit;
  }

  if (rateLimitPerUser !== undefined) {
    if (rateLimitPerUser < 0 || rateLimitPerUser > 21600) {
      throw new Error("Rate limit per user must be between 0 and 21600 seconds");
    }
    body.rate_limit_per_user = rateLimitPerUser;
  }

  if (position !== undefined) {
    body.position = position;
  }

  if (parentId) {
    body.parent_id = parentId;
  }

  // Create channel
  const response = await client["POST /guilds/:guild_id/channels"]({
    guild_id: guildId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to create channel: ${response.statusText}`,
    );
  }

  const channel = await response.json();
  return channel;
} 