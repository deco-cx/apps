import {
  BotRoutingConfig,
  ChannelBotConfig,
  ResolvedBotConfig,
} from "../types/bot-routing.ts";

/**
 * @description Bot routing system that resolves which bot configuration to use for each channel
 */
export class BotRouter {
  private config: BotRoutingConfig;

  constructor(config: BotRoutingConfig) {
    this.config = config;
  }

  /**
   * @description Resolves the bot configuration for a specific channel
   * @param channelId The channel ID to resolve configuration for
   * @returns The resolved bot configuration
   */
  resolveForChannel(channelId: string): ResolvedBotConfig {
    // First, check if there's a specific configuration for this channel
    const channelBot = this.config.channelBots[channelId];

    if (channelBot && channelBot.isActive) {
      return {
        config: channelBot,
        isDefault: false,
        channelId,
      };
    }

    // Fall back to default bot configuration
    const defaultBot = this.config.defaultBot;

    if (!defaultBot) {
      throw new Error("No default bot configuration available");
    }

    if (!defaultBot.isActive) {
      throw new Error(
        "Default bot configuration is inactive and cannot be used",
      );
    }

    return {
      config: defaultBot,
      isDefault: true,
      channelId,
    };
  }

  /**
   * @description Sets a bot configuration for a specific channel
   * @param channelId The channel ID
   * @param config The bot configuration
   */
  setChannelBot(channelId: string, config: ChannelBotConfig): void {
    const existingBot = this.config.channelBots[channelId];
    const now = new Date().toISOString();

    this.config.channelBots[channelId] = {
      ...config,
      channelId,
      createdAt: existingBot?.createdAt || config.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @description Removes a bot configuration for a specific channel
   * @param channelId The channel ID
   */
  removeChannelBot(channelId: string): void {
    delete this.config.channelBots[channelId];
  }

  /**
   * @description Updates the default bot configuration
   * @param config The new default bot configuration
   */
  setDefaultBot(config: ChannelBotConfig): void {
    const existingDefaultBot = this.config.defaultBot;
    const now = new Date().toISOString();

    this.config.defaultBot = {
      ...config,
      createdAt: existingDefaultBot?.createdAt || config.createdAt || now,
      updatedAt: now,
    };
  }

  /**
   * @description Gets all channel-specific bot configurations
   * @returns Record of channel ID to bot configuration
   */
  getAllChannelBots(): Record<string, ChannelBotConfig> {
    return { ...this.config.channelBots };
  }

  /**
   * @description Gets the default bot configuration
   * @returns The default bot configuration
   */
  getDefaultBot(): ChannelBotConfig {
    return this.config.defaultBot;
  }

  /**
   * @description Lists all active bot configurations for this team
   * @returns Array of all bot configurations
   */
  listAllConfigurations(): ChannelBotConfig[] {
    const configurations: ChannelBotConfig[] = [];

    // Only include default bot if it exists and is active
    if (this.config.defaultBot && this.config.defaultBot.isActive) {
      configurations.push(this.config.defaultBot);
    }

    // Include channel bots that are active
    Object.values(this.config.channelBots).forEach((config) => {
      if (config.isActive) {
        configurations.push(config);
      }
    });

    return configurations;
  }

  /**
   * @description Checks if a channel has a specific bot configuration
   * @param channelId The channel ID to check
   * @returns True if channel has specific configuration
   */
  hasChannelBot(channelId: string): boolean {
    return !!this.config.channelBots[channelId]?.isActive;
  }

  /**
   * @description Gets the current routing configuration
   * @returns A deep copy of the routing configuration
   */
  getConfig(): BotRoutingConfig {
    return structuredClone(this.config);
  }

  /**
   * @description Updates the entire routing configuration
   * @param config The new routing configuration
   */
  updateConfig(config: BotRoutingConfig): void {
    this.config = config;
  }
}

/**
 * @description Creates a default bot routing configuration
 * @param teamId The team/workspace ID
 * @param defaultBotName The default bot name
 * @returns A default routing configuration
 */
export function createDefaultBotRouting(
  teamId: string,
  defaultBotName: string = "deco.chat",
): BotRoutingConfig {
  const now = new Date().toISOString();

  return {
    teamId,
    defaultBot: {
      id: `default-${teamId}`,
      channelId: "*", // Wildcard for default
      botName: defaultBotName,
      displayName: defaultBotName,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    channelBots: {},
  };
}

/**
 * @description Validates a bot configuration
 * @param config The configuration to validate
 * @returns Validation result with any errors
 */
export function validateBotConfig(config: Partial<ChannelBotConfig>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.botName || config.botName.trim() === "") {
    errors.push("Bot name is required");
  }

  if (!config.channelId || config.channelId.trim() === "") {
    errors.push("Channel ID is required");
  }

  if (config.botName && config.botName.length > 80) {
    errors.push("Bot name must be 80 characters or less");
  }

  if (config.displayName && config.displayName.length > 80) {
    errors.push("Display name must be 80 characters or less");
  }

  if (config.description && config.description.length > 250) {
    errors.push("Description must be 250 characters or less");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
