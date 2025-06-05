import { UnlinkChannelProps } from "../../../mcp/bindings.ts";
import type { AppContext } from "../../mod.ts";

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
  await ctx.appStorage.removeItem(
    ctx.cb.forTeam(teamId, props.discriminator),
  );
}
