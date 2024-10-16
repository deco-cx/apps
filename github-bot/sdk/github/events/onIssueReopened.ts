import { STATUS_CODE } from "@std/http/status";
import { ButtonStyles, sendMessage } from "../../../deps/discordeno.ts";
import type { AppContext, Project } from "../../../mod.ts";
import type { WebhookEvent } from "../types.ts";
import { createActionRow, createButton } from "../../discord/components.ts";
import { bold, timestamp } from "../../discord/textFormatting.ts";
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
  const row = createActionRow([
    createButton({
      label: "Ver no GitHub",
      url: issue.html_url,
      style: ButtonStyles.Link,
    }),
  ]);

  const selfReopened = sender.login === issue.user?.login;

  await sendMessage(
    bot,
    channelId,
    {
      embeds: [{
        thumbnail: {
          url: sender.avatar_url,
        },
        title: selfReopened
          ? `${sender.login} re-abriu uma Issue`
          : `${sender.login} re-abriu a issue de ${
            issue.user?.login || "alguém"
          }`,
        description: `${bold(`(${repository.full_name})`)}
[${bold(`#${issue.number} - ${issue.title}`)}](${issue.html_url}) - ${
          timestamp(seconds, "R")
        }`,
        color: 0x02c563,
        timestamp: new Date(issue.created_at).getTime(),
      }],
      components: [row],
    },
  );

  return new Response(null, { status: STATUS_CODE.NoContent });
}
