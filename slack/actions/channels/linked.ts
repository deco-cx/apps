import { OnChannelLinkedProps } from "../../../mcp/bindings.ts";
import type { AppContext } from "../../mod.ts";

/**
 * @name ON_CHANNEL_LINKED
 * @description This action is triggered when slack binding is linked
 */
export default async function linked(
  props: OnChannelLinkedProps,
  _req: Request,
  ctx: AppContext,
) {
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  if (teamId) {
    await ctx.appStorage.setItem(teamId, {
      installId: ctx.installId,
      ...props,
    });
  }
}
