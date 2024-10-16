import { STATUS_CODE } from "@std/http/status";
import {
  type DiscordInteraction,
  InteractionTypes,
  verifySignature,
} from "../deps/discordeno.ts";
import type { AppContext } from "../mod.ts";
import buttons from "../sdk/discord/buttons/index.ts";
import commands from "../sdk/discord/commands/index.ts";
import ping from "../sdk/discord/commands/ping.ts";
import { Interaction } from "../sdk/discord/lib.ts";

export default function action(
  props: DiscordInteraction,
  req: Request,
  ctx: AppContext,
) {
  if (req.method === "POST") {
    const signature = req.headers.get("x-signature-ed25519") || "";
    const timestamp = req.headers.get("x-signature-timestamp") || "";
    const publicKey = ctx.discord.public_key;
    const rawBody = JSON.stringify(props);

    const { isValid } = verifySignature({
      signature,
      timestamp,
      publicKey,
      body: rawBody,
    });

    if (!isValid) {
      return new Response("Invalid signature", {
        status: STATUS_CODE.Unauthorized,
      });
    }
  }

  const interaction = new Interaction(props, ctx.discord.bot);

  if (interaction.type === InteractionTypes.Ping) {
    return ping();
  }

  if (!interaction.data) {
    return new Response(null, { status: STATUS_CODE.BadRequest });
  }

  if (interaction.isApplicationCommandInteraction()) {
    const command = commands.get(interaction.data.name);

    if (!command) {
      return new Response(null, { status: STATUS_CODE.NotFound });
    }

    return command.execute(
      interaction,
      req,
      ctx,
    ).catch((err) => {
      console.error(err);
      return new Response(null, { status: STATUS_CODE.InternalServerError });
    }).finally(() => new Response(null, { status: STATUS_CODE.OK }));
  }

  if (interaction.isButtonInteraction()) {
    const buttonData = interaction.parseCustomId();
    if (!buttonData) {
      return new Response(null, { status: STATUS_CODE.BadRequest });
    }

    const button = buttons.get(buttonData.id);

    if (!button) {
      return new Response(null, { status: STATUS_CODE.NotFound });
    }

    return button.execute(
      interaction,
      req,
      ctx,
    ).catch((err) => {
      console.error(err);
      return new Response(null, { status: STATUS_CODE.InternalServerError });
    }).finally(() => new Response(null, { status: STATUS_CODE.OK }));
  }
}
