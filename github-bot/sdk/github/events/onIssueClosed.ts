import { STATUS_CODE } from "@std/http/status";
import { sendMessage } from "../../../deps/discordeno.ts";
import type { AppContext, Project } from "../../../mod.ts";
import { bold, timestamp } from "../../discord/textFormatting.ts";
import type { WebhookEvent } from "../types.ts";
import { isDraft } from "../utils.ts";

export default async function onIssueClosed(
  props: WebhookEvent<"issues-closed">,
  project: Project,
  ctx: AppContext,
) {
  const bot = ctx.discord.bot;
  const { issue, repository, sender } = props;

  if (isDraft(issue.title)) {
    return new Response(null, { status: STATUS_CODE.NoContent });
  }

  const seconds = Math.floor(
    new Date(issue.created_at).getTime() / 1000,
  );
  const channelId = project.discord.pr_channel_id;

  const selfClosed = issue.user.login === sender.login;
  const title = selfClosed
    ? `${sender.login} fechou a própria Issue`
    : `${sender.login} fechou a issue de ${issue.user.login}`;

  await sendMessage(
    bot,
    channelId,
    {
      content: `${bold(title)}\n(${repository.full_name}) [${
        bold(`#${issue.number} - ${issue.title}`)
      }](<${issue.html_url}>) - ${timestamp(seconds, "R")}`,
    },
  );

  return new Response(null, { status: STATUS_CODE.NoContent });
}
