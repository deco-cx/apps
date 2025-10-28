import type { AppContext } from "../../mod.ts";
import type { ChannelBotConfig } from "../../types/bot-routing.ts";
import { validateBotConfig } from "../../utils/bot-router.ts";

export interface Props {
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

  /**
   * @description Force update even if configuration already exists
   */
  forceUpdate?: boolean;
}

export interface SetBotConfigResponse {
  success: boolean;
  message: string;
  botId?: string;
  errors?: string[];
}

/**
 * @name SET_CHANNEL_BOT_CONFIG
 * @title Set Channel Bot Configuration
 * @description Configures a bot for a specific channel with custom settings
 */
export default async function setChannelBotConfig(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SetBotConfigResponse> {
  const {
    channelId,
    botName,
    displayName,
    avatar,
    description,
    botToken,
    clientId,
    clientSecret,
    isActive = true,
    metadata,
    forceUpdate = false,
  } = props;

  // Validate input
  const validation = validateBotConfig({
    channelId,
    botName,
    displayName,
    description,
  });

  if (!validation.isValid) {
    return {
      success: false,
      message: "Validation failed",
      errors: validation.errors,
    };
  }

  // Check if bot configuration already exists
  const { botRouter } = ctx;
  const existingBot = botRouter.hasActiveChannelBot(channelId);
  const existingBotConfig = existingBot
    ? botRouter.getAllChannelBots()[channelId]
    : null;

  if (existingBot && !forceUpdate) {
    return {
      success: false,
      message:
        `Bot configuration already exists for channel ${channelId}. Use forceUpdate=true to override.`,
    };
  }

  try {
    const now = new Date().toISOString();
    const botId = existingBotConfig?.id || `bot-${channelId}-${Date.now()}`;

    // Create new bot configuration
    const newBotConfig: ChannelBotConfig = {
      id: botId,
      channelId,
      botName,
      displayName: displayName || botName,
      avatar,
      description,
      botToken,
      clientId,
      clientSecret,
      isActive,
      createdAt: existingBotConfig?.createdAt || now,
      updatedAt: now,
      createdBy: existingBotConfig?.createdBy, // Could be extracted from request context
      metadata,
    };

    // Set the bot configuration
    botRouter.setChannelBot(channelId, newBotConfig);

    // Update the app configuration to persist the changes
    const currentConfig = await ctx.getConfiguration();
    await ctx.configure({
      ...currentConfig,
      botRouting: botRouter.getConfig(),
    });

    return {
      success: true,
      message: `Bot configuration ${
        existingBot ? "updated" : "created"
      } successfully for channel ${channelId}`,
      botId,
    };
  } catch (error) {
    console.error("Error setting bot configuration:", error);
    return {
      success: false,
      message: `Failed to set bot configuration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
