import type { AppContext } from "../../mod.ts";

export interface Props {
  /**
   * @description Channel ID to remove bot configuration from
   */
  channelId: string;
}

export interface RemoveBotConfigResponse {
  success: boolean;
  message: string;
}

/**
 * @name REMOVE_CHANNEL_BOT_CONFIG
 * @title Remove Channel Bot Configuration
 * @description Removes bot configuration for a specific channel, reverting to default bot
 */
export default async function removeChannelBotConfig(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RemoveBotConfigResponse> {
  const { channelId } = props;

  if (!channelId || channelId.trim() === "") {
    return {
      success: false,
      message: "Channel ID is required",
    };
  }

  try {
    const { botRouter } = ctx;

    // Check if bot configuration exists
    if (!botRouter.hasChannelBot(channelId)) {
      return {
        success: false,
        message: `No bot configuration found for channel ${channelId}`,
      };
    }

    // Remove the bot configuration
    botRouter.removeChannelBot(channelId);

    // Update the app configuration to persist the changes
    const currentConfig = await ctx.getConfiguration();
    await ctx.configure({
      ...currentConfig,
      botRouting: botRouter.getConfig(),
    });

    return {
      success: true,
      message:
        `Bot configuration removed successfully for channel ${channelId}. Channel will now use the default bot.`,
    };
  } catch (error) {
    console.error("Error removing bot configuration:", error);
    return {
      success: false,
      message: `Failed to remove bot configuration: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    };
  }
}
