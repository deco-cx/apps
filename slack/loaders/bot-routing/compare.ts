import type { AppContext } from "../../mod.ts";
import {
  ChannelBotConfig,
  PublicChannelBotConfig,
  PublicResolvedBotConfig,
  ResolvedBotConfig,
} from "../../types/bot-routing.ts";

export interface Props {
  /**
   * @description Array of channel IDs to compare configurations for
   */
  channelIds: string[];
}

export interface ChannelComparisonResult {
  channelId: string;
  resolvedConfig: PublicResolvedBotConfig;
}

export interface BotConfigComparisonResponse {
  channels: ChannelComparisonResult[];
  uniqueConfigs: number;
  allUsingDefault: boolean;
}

/**
 * @name COMPARE_CHANNEL_BOT_CONFIGS
 * @title Compare Channel Bot Configurations
 * @description Compares bot configurations across multiple channels
 */
export default function compareChannelBotConfigs(
  props: Props,
  _req: Request,
  ctx: AppContext,
): BotConfigComparisonResponse {
  const { channelIds } = props;

  // Early return for empty input
  if (!channelIds || channelIds.length === 0) {
    return {
      channels: [],
      uniqueConfigs: 0,
      allUsingDefault: true,
    };
  }

  const { botRouter } = ctx;

  // Helper function to redact sensitive fields from bot config
  const redactBotConfig = (
    config: ChannelBotConfig,
  ): PublicChannelBotConfig => {
    const {
      botToken: _botToken,
      clientSecret: _clientSecret,
      clientId: _clientId,
      metadata,
      ...publicConfig
    } = config;

    // Extract safe metadata subset (only string, number, boolean values)
    const publicMetadata: Record<string, string | number | boolean> = {};
    if (metadata && typeof metadata === "object") {
      for (const [key, value] of Object.entries(metadata)) {
        if (
          typeof value === "string" || typeof value === "number" ||
          typeof value === "boolean"
        ) {
          publicMetadata[key] = value;
        }
      }
    }

    return {
      ...publicConfig,
      hasClientId: Boolean(_clientId),
      hasMetadata: Boolean(metadata && Object.keys(metadata).length > 0),
      publicMetadata: Object.keys(publicMetadata).length > 0
        ? publicMetadata
        : undefined,
    };
  };

  // Helper function to redact resolved config
  const redactResolvedConfig = (
    resolved: ResolvedBotConfig,
  ): PublicResolvedBotConfig => ({
    config: redactBotConfig(resolved.config),
    isDefault: resolved.isDefault,
    channelId: resolved.channelId,
  });

  const channels: ChannelComparisonResult[] = channelIds.map((channelId) => ({
    channelId,
    resolvedConfig: redactResolvedConfig(
      botRouter.resolveForChannel(channelId),
    ),
  }));

  // Count unique configurations
  const uniqueConfigIds = new Set(
    channels.map((ch) => ch.resolvedConfig.config.id),
  );

  // Check if all channels are using default configuration
  const allUsingDefault = channels.every((ch) => ch.resolvedConfig.isDefault);

  return {
    channels,
    uniqueConfigs: uniqueConfigIds.size,
    allUsingDefault,
  };
}
