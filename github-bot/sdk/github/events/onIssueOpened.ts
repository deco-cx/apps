import { STATUS_CODE } from "@std/http/status";
import { ButtonStyles, sendMessage } from "../../../deps/discordeno.ts";
import type { AppContext, Project } from "../../../mod.ts";
import type { WebhookEvent } from "../../../sdk/github/types.ts";
import { createActionRow, createButton } from "../../discord/components.ts";
import { bold, timestamp } from "../../discord/textFormatting.ts";
import { isDraft } from "../utils.ts";

export default async function onIssueOpened(
  props: WebhookEvent<"issues-opened">,
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

  await sendMessage(
    bot,
    channelId,
    {
      embeds: [{
        thumbnail: {
          url: sender.avatar_url,
        },
        title: `${sender.login} abriu uma nova Issue`,
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
