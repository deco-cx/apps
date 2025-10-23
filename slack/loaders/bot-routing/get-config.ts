import type { AppContext } from "../../mod.ts";
import { ResolvedBotConfig } from "../../types/bot-routing.ts";

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
): ResolvedBotConfig {
  const { channelId } = props;
  const { botRouter } = ctx;

  return botRouter.resolveForChannel(channelId);
}
