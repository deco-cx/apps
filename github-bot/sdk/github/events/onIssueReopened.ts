import { STATUS_CODE } from "@std/http/status";
import { sendMessage } from "../../../deps/discordeno.ts";
import type { AppContext, Project } from "../../../mod.ts";
import { bold, timestamp } from "../../discord/textFormatting.ts";
import type { WebhookEvent } from "../types.ts";
import { isDraft } from "../utils.ts";

export default async function onIssueReopened(
  props: WebhookEvent<"issues-reopened">,
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

  const selfReopened = sender.login === issue.user?.login;
  const title = selfReopened
    ? `${sender.login} re-abriu uma Issue`
    : `${sender.login} re-abriu a issue de ${issue.user?.login || "alguém"}`;
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
