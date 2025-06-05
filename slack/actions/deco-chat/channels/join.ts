import { JoinChannelProps } from "../../../../mcp/bindings.ts";
import type { AppContext } from "../../../mod.ts";

/**
 * @name DECO_CHAT_CHANNELS_JOIN
 * @description This action is triggered when channel is selected
 */
export default async function join(
  props: JoinChannelProps,
  _req: Request,
  ctx: AppContext,
) {
  const config = await ctx.getConfiguration(ctx.installId);
  const teamId = ctx.teamId ?? config.teamId;
  if (teamId) {
    await ctx.appStorage.setItem<JoinChannelProps & { installId: string }>(
      ctx.cb.forTeam(teamId, props.discriminator),
      {
        installId: ctx.installId,
        ...props,
      },
    );
  }
}
