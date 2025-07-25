import {
  ListChannelsProps,
  ListChannelsResponse,
} from "../../../../mcp/bindings.ts";
import type { AppContext } from "../../../mod.ts";

export const DECO_CHAT_CHANNEL_ID = "@deco.chat";
/**
 * @name DECO_CHAT_CHANNELS_LIST
 * @description This action is triggered when slack channels are needed
 */
export default async function list(
  _props: ListChannelsProps,
  _req: Request,
  ctx: AppContext,
): Promise<ListChannelsResponse> {
  const channels = await ctx.invoke.slack.loaders.channels({});
  return {
    channels: [
      ...channels.channels.map((ch) => {
        return {
          label: ch.name,
          value: ch.id,
        };
      }),
      ...ctx.botUserId
        ? [{
          label: DECO_CHAT_CHANNEL_ID,
          value: DECO_CHAT_CHANNEL_ID,
        }]
        : [],
    ],
  };
}
