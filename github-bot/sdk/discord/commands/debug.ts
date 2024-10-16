import {
  ApplicationCommandTypes,
  type DiscordCreateApplicationCommand,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import type { AppContext } from "../../../mod.ts";
import confirmReview from "../buttons/confirmReview.ts";
import { createActionRow } from "../components.ts";
import type { Interaction } from "../lib.ts";

const data: DiscordCreateApplicationCommand = {
  name: "debug",
  description: "debug",
  type: ApplicationCommandTypes.ChatInput,
  dm_permission: false,
};

async function execute(
  interaction: Interaction,
  _req: Request,
  _ctx: AppContext,
) {
  const row = createActionRow([
    confirmReview.component("504717946124369937"),
  ]);

  return await interaction.respondWithMessage({
    content: "Hello",
    components: [row],
  });
}

export default {
  data,
  execute,
};
