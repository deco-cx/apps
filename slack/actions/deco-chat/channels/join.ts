import { JoinChannelProps } from "../../../../mcp/bindings.ts";
import { DECO_CHAT_CHANNEL_ID } from "../../../loaders/deco-chat/channels/list.ts";
import type { AppContext } from "../../../mod.ts";

/**
 * @name DECO_CHAT_CHANNELS_JOIN
 * @title Deco Chat Channel Join
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
    await ctx.slack.joinChannel(props.discriminator).catch((error) => {
      console.error("error joining channel", error);
    });
    if (props.agentName && props.agentLink) {
      const botIdentifier = config.customBotName
        ? `@${config.customBotName}`
        : DECO_CHAT_CHANNEL_ID;
      await ctx.slack.postMessage(
        props.discriminator,
        `<${props.agentLink}|${props.agentName}> has joined the channel! To interact with me, just mention ${botIdentifier} in your messages!`,
      ).catch((err) => {
        console.error("error posting welcome", err);
      });
    }
  }
}
