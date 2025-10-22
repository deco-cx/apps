import type { AppContext } from "../../mod.ts";
import { ResolvedBotConfig } from "../../types/bot-routing.ts";

export interface Props {
  /**
   * @description Array of channel IDs to compare configurations for
   */
  channelIds: string[];
}

export interface ChannelComparisonResult {
  channelId: string;
  resolvedConfig: ResolvedBotConfig;
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
  const { botRouter } = ctx;

  const channels: ChannelComparisonResult[] = channelIds.map(channelId => ({
    channelId,
    resolvedConfig: botRouter.resolveForChannel(channelId),
  }));

  // Count unique configurations
  const uniqueConfigIds = new Set(
    channels.map(ch => ch.resolvedConfig.config.id)
  );

  // Check if all channels are using default configuration
  const allUsingDefault = channels.every(ch => ch.resolvedConfig.isDefault);

  return {
    channels,
    uniqueConfigs: uniqueConfigIds.size,
    allUsingDefault,
  };
}