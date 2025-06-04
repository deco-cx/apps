import { UnlinkChannelProps } from "../../../mcp/bindings.ts";
import type { AppContext, Props } from "../../mod.ts";

/**
 * @name UNLINK_CHANNEL
 * @description This action is triggered when slack binding is unlinked
 */
export default async function unlink(
  props: UnlinkChannelProps,
  _req: Request,
  ctx: AppContext,
) {
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  if (!teamId) {
    return;
  }
  const item = await ctx.appStorage.getItem<Props>(teamId);
  if (!item) return;
  delete item.channels?.[props.discriminator];
  await ctx.appStorage.setItem(teamId, item);
}
