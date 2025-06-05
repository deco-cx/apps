import {
  ListChannelsProps,
  ListChannelsResponse,
} from "../../../../mcp/bindings.ts";
import type { AppContext } from "../../../mod.ts";

/**
 * @name DECO_CHAT_CHANNELS_LIST
 * @description This action is triggered when slack channels are needed
 */
export default async function leave(
  _props: ListChannelsProps,
  _req: Request,
  ctx: AppContext,
): Promise<ListChannelsResponse> {
  if (!ctx.teamId) {
    throw new Error("Team ID is required");
  }
  const channels = await ctx.slack.getChannels(ctx.teamId);
  return {
    channels: channels.data.channels.map((ch) => {
      return {
        label: ch.name,
        value: ch.id,
      };
    }),
  };
}
