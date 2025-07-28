import type { AppContext } from "../mod.ts";
import { DiscordChannel } from "../utils/types.ts";

export interface Props {
  /**
   * @title Channel ID
   * @description ID of the channel to edit
   */
  channelId: string;

  /**
   * @title Channel Name
   * @description New name for the channel (2-100 characters)
   */
  name?: string;

  /**
   * @title Topic
   * @description New channel topic (0-1024 characters, text channels only)
   */
  topic?: string;

  /**
   * @title NSFW
   * @description Whether the channel is NSFW
   */
  nsfw?: boolean;

  /**
   * @title Rate Limit Per User
   * @description Seconds a user has to wait before sending another message (0-21600)
   */
  rateLimitPerUser?: number;

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
   * @title Parent ID
   * @description ID of the parent category for this channel (null to remove from category)
   */
  parentId?: string | null;

  /**
   * @title RTC Region
   * @description Voice region for voice channels
   */
  rtcRegion?: string | null;

  /**
   * @title Video Quality Mode
   * @description Camera video quality mode for voice channels (1 = auto, 2 = full)
   */
  videoQualityMode?: 1 | 2;

  /**
   * @title Default Auto Archive Duration
   * @description Default duration for newly created threads to auto-archive
   */
  defaultAutoArchiveDuration?: 60 | 1440 | 4320 | 10080;

  /**
   * @title Reason
   * @description Reason for editing the channel (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Edit Channel
 * @description Edit settings of an existing Discord channel
 */
export default async function editChannel(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordChannel> {
  const {
    channelId,
    name,
    topic,
    nsfw,
    rateLimitPerUser,
    bitrate,
    userLimit,
    parentId,
    rtcRegion,
    videoQualityMode,
    defaultAutoArchiveDuration,
    reason,
  } = props;
  const { client } = ctx;

  if (!channelId) {
    throw new Error("Channel ID is required");
  }

  // Build request body (only include provided fields)
  const body: any = {};

  if (name !== undefined) {
    if (name.length < 2 || name.length > 100) {
      throw new Error("Channel name must be between 2 and 100 characters");
    }
    body.name = name;
  }

  if (topic !== undefined) {
    if (topic.length > 1024) {
      throw new Error("Channel topic cannot exceed 1024 characters");
    }
    body.topic = topic;
  }

  if (nsfw !== undefined) {
    body.nsfw = nsfw;
  }

  if (rateLimitPerUser !== undefined) {
    if (rateLimitPerUser < 0 || rateLimitPerUser > 21600) {
      throw new Error("Rate limit per user must be between 0 and 21600 seconds");
    }
    body.rate_limit_per_user = rateLimitPerUser;
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

  if (parentId !== undefined) {
    body.parent_id = parentId;
  }

  if (rtcRegion !== undefined) {
    body.rtc_region = rtcRegion;
  }

  if (videoQualityMode !== undefined) {
    body.video_quality_mode = videoQualityMode;
  }

  if (defaultAutoArchiveDuration !== undefined) {
    body.default_auto_archive_duration = defaultAutoArchiveDuration;
  }

  // Check if at least one field is being updated
  if (Object.keys(body).length === 0) {
    throw new Error("At least one field must be provided to edit the channel");
  }

  // Edit channel
  const response = await client["PATCH /channels/:channel_id"]({
    channel_id: channelId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to edit channel: ${response.statusText}`,
    );
  }

  const channel = await response.json();
  return channel;
} 