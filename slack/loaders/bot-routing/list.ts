import type { AppContext } from "../../mod.ts";
import { ChannelBotConfig } from "../../types/bot-routing.ts";

export interface Props {
  /**
   * @description Filter by channel ID (optional)
   */
  channelId?: string;

  /**
   * @description Include inactive configurations
   */
  includeInactive?: boolean;
}

export interface BotConfigListResponse {
  defaultBot: ChannelBotConfig;
  channelBots: ChannelBotConfig[];
  totalConfigs: number;
  teamId: string;
}

/**
 * @name LIST_BOT_CONFIGURATIONS
 * @title List Bot Configurations
 * @description Lists all bot configurations for the workspace
 */
export default function listBotConfigurations(
  props: Props,
  _req: Request,
  ctx: AppContext,
): BotConfigListResponse {
  const { channelId, includeInactive = false } = props;
  const { botRouter, teamId } = ctx;

  const defaultBot = botRouter.getDefaultBot();
  let channelBots: ChannelBotConfig[] = Object.values(
    botRouter.getAllChannelBots(),
  );

  // Filter by channel if specified
  if (channelId) {
    channelBots = channelBots.filter((bot: ChannelBotConfig) =>
      bot.channelId === channelId
    );
  }

  // Filter out inactive bots unless requested
  if (!includeInactive) {
    channelBots = channelBots.filter((bot: ChannelBotConfig) => bot.isActive);
  }

  return {
    defaultBot,
    channelBots,
    totalConfigs: channelBots.length + 1, // +1 for default bot
    teamId: teamId || "",
  };
}
