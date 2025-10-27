import type { AppContext } from "../../mod.ts";
import {
  ChannelBotConfig,
  PublicChannelBotConfig,
  PublicResolvedBotConfig,
  ResolvedBotConfig,
} from "../../types/bot-routing.ts";

export interface Props {
  /**
   * @description Channel ID to get bot configuration for
   */
  channelId: string;
}

/**
 * @name GET_CHANNEL_BOT_CONFIG
 * @title Get Channel Bot Configuration
 * @description Gets the bot configuration that will be used for a specific channel
 */
export default function getChannelBotConfig(
  props: Props,
  _req: Request,
  ctx: AppContext,
): PublicResolvedBotConfig {
  const { channelId } = props;
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

  const resolvedConfig = botRouter.resolveForChannel(channelId);
  return redactResolvedConfig(resolvedConfig);
}
