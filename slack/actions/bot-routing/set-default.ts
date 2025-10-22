import type { AppContext } from "../../mod.ts";
import { validateBotConfig } from "../../utils/bot-router.ts";

export interface Props {
  /**
   * @description Default bot name
   */
  botName: string;

  /**
   * @description Default bot display name (optional)
   */
  displayName?: string;

  /**
   * @description Default bot avatar (optional)
   */
  avatar?: string;

  /**
   * @description Default bot description (optional)
   */
  description?: string;

  /**
   * @description Default bot token (optional)
   */
  botToken?: string;

  /**
   * @description Default client ID for OAuth (optional)
   */
  clientId?: string;

  /**
   * @description Default client secret for OAuth (optional)
   */
  clientSecret?: string;

  /**
   * @description Additional metadata
   */
  metadata?: Record<string, unknown>;
}

export interface SetDefaultBotResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

/**
 * @name SET_DEFAULT_BOT_CONFIG
 * @title Set Default Bot Configuration
 * @description Updates the default bot configuration that will be used for channels without specific configuration
 */
export default async function setDefaultBotConfig(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SetDefaultBotResponse> {
  const {
    botName,
    displayName,
    avatar,
    description,
    botToken,
    clientId,
    clientSecret,
    metadata,
  } = props;

  // Validate input
  const validation = validateBotConfig({
    channelId: "*", // Wildcard for default
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

  try {
    const { botRouter } = ctx;
    const now = new Date().toISOString();
    const currentDefault = botRouter.getDefaultBot();

    // Create updated default bot configuration
    const updatedDefaultBot = {
      id: currentDefault.id,
      channelId: "*",
      botName,
      displayName: displayName || botName,
      avatar,
      description,
      botToken,
      clientId,
      clientSecret,
      isActive: true,
      createdAt: currentDefault.createdAt,
      updatedAt: now,
      createdBy: currentDefault.createdBy,
      metadata,
    };

    // Update the default bot configuration
    botRouter.setDefaultBot(updatedDefaultBot);

    // Update the app configuration to persist the changes
    const currentConfig = await ctx.getConfiguration();
    await ctx.configure({
      ...currentConfig,
      botRouting: botRouter.getConfig(),
      customBotName: botName, // Also update the legacy field for backward compatibility
    });

    return {
      success: true,
      message: "Default bot configuration updated successfully",
    };
  } catch (error) {
    console.error("Error setting default bot configuration:", error);
    return {
      success: false,
      message: `Failed to set default bot configuration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
