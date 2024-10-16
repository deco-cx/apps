import { sendMessage } from "../../deps/discordeno.ts";
import type { AppContext } from "../../mod.ts";
import { userMention } from "../../sdk/discord/textFormatting.ts";
import type { ProjectUser } from "../../types.ts";

export interface Props {
  channelId: string;
  reviewer: ProjectUser;
}

export default async function action(
  { channelId, reviewer }: Props,
  _req: Request,
  ctx: AppContext,
) {
  await sendMessage(ctx.discord.bot, channelId, {
    content: `Pode confirmar o pedido de revisão? ${
      userMention(
        reviewer.discordId,
      )
    }`,
  }).catch(console.error);
}
