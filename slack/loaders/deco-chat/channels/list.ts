import {
  ListChannelsProps,
  ListChannelsResponse,
} from "../../../../mcp/bindings.ts";
import type { AppContext } from "../../../mod.ts";

export const DECO_CHAT_CHANNEL_ID = "@deco.chat";
/**
 * @name DECO_CHAT_CHANNELS_LIST
 * @title Deco Chat Channels List
 * @description This action is triggered when slack channels are needed
 */
export default async function list(
  _props: ListChannelsProps,
  _req: Request,
  ctx: AppContext,
): Promise<ListChannelsResponse> {
  const channels = await ctx.invoke.slack.loaders.channels({});

  // Use custom bot name or fallback to default
  const botIdentifier = ctx.customBotName
    ? `@${ctx.customBotName}`
    : DECO_CHAT_CHANNEL_ID;

  return {
    channels: [
      ...channels.data.channels.map((ch: { name?: string; id: string }) => {
        return {
          label: ch.name ?? "",
          value: ch.id,
        };
      }),
      ...ctx.botUserId
        ? [{
          label: botIdentifier,
          value: botIdentifier,
        }]
        : [],
    ],
  };
}
