import type { AppContext } from "../../mod.ts";
import {
  ChannelBotConfig,
  PublicBotConfigWithFlags,
} from "../../types/bot-routing.ts";

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
  defaultBot: PublicBotConfigWithFlags;
  channelBots: PublicBotConfigWithFlags[];
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

  // Helper function to redact sensitive fields and add presence flags
  const redactBotConfig = (
    config: ChannelBotConfig,
  ): PublicBotConfigWithFlags => {
    const { botToken, clientSecret, ...publicFields } = config;
    return {
      ...publicFields,
      hasBotToken: Boolean(botToken),
      hasClientSecret: Boolean(clientSecret),
    };
  };

  const defaultBot = redactBotConfig(botRouter.getDefaultBot());
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

  // Sort by updatedAt descending for stable UX
  channelBots.sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  // Redact sensitive fields from channel bots
  const redactedChannelBots = channelBots.map(redactBotConfig);

  return {
    defaultBot,
    channelBots: redactedChannelBots,
    totalConfigs: redactedChannelBots.length + 1, // +1 for default bot
    teamId: teamId || "",
  };
}
