import { STATUS_CODE } from "@std/http/status";
import { type Embed, sendMessage } from "../../deps/discordeno.ts";
import type { AppContext } from "../../mod.ts";
import { dateInSeconds, isToday } from "../../sdk/date.ts";
import { inlineCode, timestamp } from "../../sdk/discord/textFormatting.ts";
import { isDraft } from "../../sdk/github/utils.ts";

export default async function action(
  _props: unknown,
  req: Request,
  ctx: AppContext,
) {
  if (req.method !== "GET") {
    return new Response(null, { status: STATUS_CODE.MethodNotAllowed });
  }

  const secret = req.headers.get("x-cron-secret");
  if (!secret || secret !== ctx.cronJobSecret?.get()) {
    return new Response(null, { status: STATUS_CODE.Unauthorized });
  }

  for (const project of ctx.projects.filter((project) => project.active)) {
    const openPullRequests = (await ctx.githubClient.getPullRequests({
      owner: project.github.org_name,
      repo: project.github.repo_name,
      state: "open",
      direction: "desc",
      sort: "created",
    })).filter((pr) => !isDraft(pr.title));

    const closedPullRequests = (await ctx.githubClient.getPullRequests({
      owner: project.github.org_name,
      repo: project.github.repo_name,
      state: "closed",
      direction: "desc",
      sort: "updated",
    })).filter((pr) => pr.closed_at && isToday(pr.closed_at));

    if (!openPullRequests.length && !closedPullRequests.length) {
      continue;
    }

    const embeds: Embed[] = [
      {
        title: `${project.github.org_name}/${project.github.repo_name}`,
        description: "Resumo das pull requests de hoje",
      },
    ];

    if (openPullRequests.length) {
      embeds.push({
        title: `(${openPullRequests.length}) Pull requests abertos`,
        color: 0x02c563,
        fields: openPullRequests.slice(0, 10).map((pr) => ({
          name: `${pr.number} | ${pr.title}`,
          value: `Criado ${
            timestamp(dateInSeconds(pr.created_at), "R")
          }\nCriado por ${
            inlineCode(pr.user?.login ?? "No user")
          }\n[Ver no GitHub](${pr.html_url})`,
          inline: false,
        })),
      });
    }

    if (closedPullRequests.length) {
      embeds.push({
        title: `(${closedPullRequests.length}) Pull requests mergeados hoje`,
        color: 0x8957e5,
        fields: closedPullRequests.slice(0, 10).map((pr) => ({
          name: `${pr.number} | ${pr.title}`,
          value: `Fechado ${
            timestamp(dateInSeconds(pr.updated_at), "R")
          }\nCriado por ${
            inlineCode(pr.user?.login ?? "No user")
          }\n[Ver no GitHub](${pr.html_url})`,
          inline: false,
        })),
      });
    }

    sendMessage(ctx.discord.bot, project.discord.summary_channel_id, {
      embeds,
    });
  }
}
