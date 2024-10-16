import { ButtonStyles } from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import type { AppContext } from "../../../mod.ts";
import { createActionRow, createButton } from "../components.ts";
import type { Interaction } from "../lib.ts";
import { userMention } from "../textFormatting.ts";
import { DiscordMessageFlags } from "../types.ts";

async function execute(
  interaction: Interaction,
  _req: Request,
  ctx: AppContext,
) {
  const { message, member } = interaction;
  const props = interaction.parseCustomId<"userId">()?.props;

  if (props?.userId === member?.user?.id) {
    return interaction.respondWithMessage({
      content: "Você não pode confirmar seu próprio pull request",
      flags: DiscordMessageFlags.Ephemeral,
    });
  }

  if (!message) {
    return interaction.respondWithMessage({
      content: "Não foi possível encontrar a mensagem",
      flags: DiscordMessageFlags.Ephemeral,
    });
  }

  await interaction.deferRespond({
    flags: DiscordMessageFlags.Ephemeral,
  });

  await ctx.invoke.workflows.actions.cancel({
    executionId: `review-pr-${message.id}`,
  });

  await interaction.editOriginalMessage({
    content: member?.user?.id ? userMention(member?.user?.id) : "",
    components: [
      createActionRow([
        createButton({
          label: `Revisor: ${member?.user?.username}`,
          style: ButtonStyles.Primary,
          disabled: true,
          customId: "noop",
        }),
      ]),
    ],
  });

  await interaction.editOriginalInteractionResponse({
    content: "Review confirmado!",
  });
}

export default {
  id: "confirm_review",
  component: (userId: string) =>
    createButton({
      label: "Confirmar Review",
      style: ButtonStyles.Primary,
      customId: `confirm_review;userId=${userId}`,
    }),
  execute,
};
