import { LinkChannelProps } from "../../../mcp/bindings.ts";
import type { AppContext } from "../../mod.ts";

/**
 * @name LINK_CHANNEL
 * @description This action is triggered when slack binding is linked
 */
export default async function link(
  props: LinkChannelProps,
  _req: Request,
  ctx: AppContext,
) {
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  console.log("linking channel", teamId, props);
  if (teamId) {
    await ctx.appStorage.setItem<LinkChannelProps & { installId: string }>(
      ctx.cb.forTeam(teamId, props.discriminator),
      {
        installId: ctx.installId,
        ...props,
      },
    );
  }
}
