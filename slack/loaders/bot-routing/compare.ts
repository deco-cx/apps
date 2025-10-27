import type { AppContext } from "../../mod.ts";
import {
  ChannelBotConfig,
  ResolvedBotConfig,
} from "../../types/bot-routing.ts";

export interface Props {
  /**
   * @description Array of channel IDs to compare configurations for
   */
  channelIds: string[];
}

/**
 * @description Public bot configuration that omits sensitive fields
 */
export interface PublicChannelBotConfig
  extends Omit<ChannelBotConfig, "botToken" | "clientSecret"> {}

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
      ...publicConfig
    } = config;
    return publicConfig;
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
