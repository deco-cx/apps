import type { AppContext } from "../mod.ts";
import { DiscordGuild } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID of the guild to edit
   */
  guildId: string;

  /**
   * @title Guild Name
   * @description New name for the guild (2-100 characters)
   */
  name?: string;

  /**
   * @title Verification Level
   * @description Verification level required before a user can send messages (0-4)
   */
  verificationLevel?: 0 | 1 | 2 | 3 | 4;

  /**
   * @title Default Message Notifications
   * @description Default message notifications level (0 = All Messages, 1 = Only Mentions)
   */
  defaultMessageNotifications?: 0 | 1;

  /**
   * @title Explicit Content Filter
   * @description Explicit content filter level (0-2)
   */
  explicitContentFilter?: 0 | 1 | 2;

  /**
   * @title AFK Channel ID
   * @description ID of AFK channel (null to remove)
   */
  afkChannelId?: string | null;

  /**
   * @title AFK Timeout
   * @description AFK timeout in seconds (60, 300, 900, 1800, 3600)
   */
  afkTimeout?: 60 | 300 | 900 | 1800 | 3600;

  /**
   * @title Icon
   * @description Guild icon (base64 encoded image data, or null to remove)
   */
  icon?: string | null;

  /**
   * @title Splash
   * @description Guild splash image (base64 encoded, or null to remove)
   */
  splash?: string | null;

  /**
   * @title Banner
   * @description Guild banner image (base64 encoded, or null to remove)
   */
  banner?: string | null;

  /**
   * @title System Channel ID
   * @description ID of system messages channel (null to disable)
   */
  systemChannelId?: string | null;

  /**
   * @title System Channel Flags
   * @description System channel flags (bitwise)
   */
  systemChannelFlags?: number;

  /**
   * @title Rules Channel ID
   * @description ID of rules channel for Community guilds
   */
  rulesChannelId?: string | null;

  /**
   * @title Public Updates Channel ID
   * @description ID of public updates channel for Community guilds
   */
  publicUpdatesChannelId?: string | null;

  /**
   * @title Preferred Locale
   * @description Preferred locale of Community guild (e.g., "en-US")
   */
  preferredLocale?: string | null;

  /**
   * @title Description
   * @description Description for Community guilds
   */
  description?: string | null;

  /**
   * @title Premium Progress Bar Enabled
   * @description Whether the guild's boost progress bar should be enabled
   */
  premiumProgressBarEnabled?: boolean;

  /**
   * @title Reason
   * @description Reason for editing the guild (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Edit Guild
 * @description Edit settings of a Discord guild/server (requires Manage Guild permission)
 */
export default async function editGuild(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuild> {
  const {
    guildId,
    name,
    verificationLevel,
    defaultMessageNotifications,
    explicitContentFilter,
    afkChannelId,
    afkTimeout,
    icon,
    splash,
    banner,
    systemChannelId,
    systemChannelFlags,
    rulesChannelId,
    publicUpdatesChannelId,
    preferredLocale,
    description,
    premiumProgressBarEnabled,
    reason,
  } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Build request body (only include provided fields)
  const body: any = {};

  if (name !== undefined) {
    if (name.length < 2 || name.length > 100) {
      throw new Error("Guild name must be between 2 and 100 characters");
    }
    body.name = name;
  }

  if (verificationLevel !== undefined) {
    body.verification_level = verificationLevel;
  }

  if (defaultMessageNotifications !== undefined) {
    body.default_message_notifications = defaultMessageNotifications;
  }

  if (explicitContentFilter !== undefined) {
    body.explicit_content_filter = explicitContentFilter;
  }

  if (afkChannelId !== undefined) {
    body.afk_channel_id = afkChannelId;
  }

  if (afkTimeout !== undefined) {
    body.afk_timeout = afkTimeout;
  }

  if (icon !== undefined) {
    body.icon = icon;
  }

  if (splash !== undefined) {
    body.splash = splash;
  }

  if (banner !== undefined) {
    body.banner = banner;
  }

  if (systemChannelId !== undefined) {
    body.system_channel_id = systemChannelId;
  }

  if (systemChannelFlags !== undefined) {
    body.system_channel_flags = systemChannelFlags;
  }

  if (rulesChannelId !== undefined) {
    body.rules_channel_id = rulesChannelId;
  }

  if (publicUpdatesChannelId !== undefined) {
    body.public_updates_channel_id = publicUpdatesChannelId;
  }

  if (preferredLocale !== undefined) {
    body.preferred_locale = preferredLocale;
  }

  if (description !== undefined) {
    body.description = description;
  }

  if (premiumProgressBarEnabled !== undefined) {
    body.premium_progress_bar_enabled = premiumProgressBarEnabled;
  }

  if (reason) {
    body.reason = reason;
  }

  // Check if at least one field is being updated
  if (Object.keys(body).filter(key => key !== 'reason').length === 0) {
    throw new Error("At least one field must be provided to edit the guild");
  }

  // Edit guild
  const response = await client["PATCH /guilds/:guild_id"]({
    guild_id: guildId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to edit guild: ${response.statusText}`,
    );
  }

  const guild = await response.json();
  return guild;
} 