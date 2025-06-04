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
  if (teamId) {
    await ctx.appStorage.setItem(teamId, {
      installId: ctx.installId,
      ...props,
      channels: {
        ...(config.channels ?? {}),
        [props.discriminator]: props.callbacks,
      },
    });
  }
}
