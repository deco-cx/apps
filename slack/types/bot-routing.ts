/**
 * @description Configuration for a bot in a specific channel
 */
export interface ChannelBotConfig {
  /**
   * @description Unique identifier for this bot configuration
   */
  id: string;

  /**
   * @description Channel ID where this bot configuration applies
   */
  channelId: string;

  /**
   * @description Custom name for the bot in this channel
   */
  botName: string;

  /**
   * @description Custom bot display name (what users see)
   */
  displayName?: string;

  /**
   * @description Bot avatar URL or emoji
   */
  avatar?: string;

  /**
   * @description Bot description for this channel
   */
  description?: string;

  /**
   * @description Custom bot token for this configuration (optional)
   */
  botToken?: string;

  /**
   * @description Client ID for custom OAuth app (optional)
   */
  clientId?: string;

  /**
   * @description Client secret for custom OAuth app (optional)
   */
  clientSecret?: string;

  /**
   * @description Whether this bot is active in the channel
   */
  isActive: boolean;

  /**
   * @description Timestamp when this configuration was created
   */
  createdAt: string;

  /**
   * @description Timestamp when this configuration was last updated
   */
  updatedAt: string;

  /**
   * @description User ID who created this configuration
   */
  createdBy?: string;

  /**
   * @description Additional metadata for the bot
   */
  metadata?: Record<string, unknown>;
}

/**
 * @description Routing configuration for bot management
 */
export interface BotRoutingConfig {
  /**
   * @description Default bot configuration (fallback)
   */
  defaultBot: ChannelBotConfig;

  /**
   * @description Channel-specific bot configurations
   */
  channelBots: Record<string, ChannelBotConfig>;

  /**
   * @description Team/workspace ID this routing applies to
   */
  teamId: string;
}

/**
 * @description Result of bot resolution for a specific channel
 */
export interface ResolvedBotConfig {
  /**
   * @description The bot configuration to use
   */
  config: ChannelBotConfig;

  /**
   * @description Whether this is the default bot or channel-specific
   */
  isDefault: boolean;

  /**
   * @description Channel ID this was resolved for
   */
  channelId: string;
}

/**
 * @description Public bot configuration that omits sensitive fields
 */
export interface PublicChannelBotConfig
  extends Omit<ChannelBotConfig, "botToken" | "clientSecret"> {}

/**
 * @description Public bot configuration with presence flags for sensitive fields
 */
export interface PublicBotConfigWithFlags {
  id: string;
  channelId: string;
  botName: string;
  displayName?: string;
  avatar?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  metadata?: Record<string, unknown>;

  // Presence flags for sensitive fields
  hasBotToken: boolean;
  hasClientSecret: boolean;
}

/**
 * @description Public resolved bot config that omits sensitive fields
 */
export interface PublicResolvedBotConfig {
  /**
   * @description The bot configuration to use (without sensitive fields)
   */
  config: PublicChannelBotConfig;

  /**
   * @description Whether this is the default bot or channel-specific
   */
  isDefault: boolean;

  /**
   * @description Channel ID this was resolved for
   */
  channelId: string;
}

/**
 * @description Request to create or update a bot configuration
 */
export interface BotConfigRequest {
  /**
   * @description Channel ID where this bot will be used
   */
  channelId: string;

  /**
   * @description Bot name
   */
  botName: string;

  /**
   * @description Bot display name (optional)
   */
  displayName?: string;

  /**
   * @description Bot avatar (optional)
   */
  avatar?: string;

  /**
   * @description Bot description (optional)
   */
  description?: string;

  /**
   * @description Custom bot token (optional)
   */
  botToken?: string;

  /**
   * @description Client ID for OAuth (optional)
   */
  clientId?: string;

  /**
   * @description Client secret for OAuth (optional)
   */
  clientSecret?: string;

  /**
   * @description Whether bot should be active
   */
  isActive?: boolean;

  /**
   * @description Additional metadata
   */
  metadata?: Record<string, unknown>;
}
