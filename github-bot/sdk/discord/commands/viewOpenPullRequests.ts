import {
  ApplicationCommandOptionTypes,
  ApplicationCommandTypes,
  type DiscordCreateApplicationCommand,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import type { AppContext } from "../../../mod.ts";
import { dateInSeconds } from "../../date.ts";
import type { Interaction } from "../lib.ts";
import { inlineCode, timestamp } from "../textFormatting.ts";

const data: DiscordCreateApplicationCommand = {
  name: "view_pull_requests",
  description: "View the open pull requests",
  type: ApplicationCommandTypes.ChatInput,
  dm_permission: false,
  name_localizations: {
    "pt-BR": "Ver pull requests",
  },
  description_localizations: {
    "pt-BR": "Veja os pull requests abertos",
  },
  options: [
    {
      name: "repository",
      description: "Repository name",
      required: true,
      type: ApplicationCommandOptionTypes.String,
    },
  ],
};

async function execute(
  interaction: Interaction,
  _req: Request,
  ctx: AppContext,
) {
  const repository = interaction.getStringOption("repository")?.value;
  const project = ctx.projects.find(
    (project) => project.github.repo_name === repository,
  );

  if (!project) {
    return interaction.respondWithMessage({
      content: "Nenhum repositório encontrado",
    });
  }

  const response = await ctx.githubClient.getPullRequests({
    owner: project.github.org_name,
    repo: project.github.repo_name,
    state: "open",
  });

  if (!response.length) {
    return interaction.respondWithMessage({
      content: "Nenhum pull request aberto foi encontrado",
    });
  }

  return interaction.respondWithMessage({
    embeds: [{
      title: `Pull Requests (${response.length})`,
      description: response.length
        ? "Lista de pull requests abertos"
        : "Nenhum pull request aberto foi encontrado",
      color: 0x02c563,
      fields: response.slice(0, 10).map((pr) => ({
        name: `${pr.number} | ${pr.title}`,
        value: `Criado ${
          timestamp(dateInSeconds(pr.created_at), "R")
        }\nCriado por ${
          inlineCode(pr.user?.login ?? "No user")
        }\n[Ver no GitHub](${pr.html_url})`,
        inline: false,
      })),
    }],
  });
}

export default {
  data,
  execute,
};
