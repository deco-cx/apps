import { LeaveChannelProps } from "../../../../mcp/bindings.ts";
import type { AppContext } from "../../../mod.ts";

/**
 * @name DECO_CHAT_CHANNELS_LEAVE
 * @title Deco Chat Channel Leave
 * @description This action is triggered when slack integration is left
 */
export default async function leave(
  props: LeaveChannelProps,
  _req: Request,
  ctx: AppContext,
) {
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  if (!teamId) {
    return;
  }
  await ctx.appStorage.removeItem(
    ctx.cb.forTeam(teamId, props.discriminator),
  );
}
