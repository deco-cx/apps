import { STATUS_CODE } from "@std/http/status";
import { sendMessage, snowflakeToBigint } from "../../../deps/discordeno.ts";
import { AppContext, Project } from "../../../mod.ts";
import { WebhookEvent } from "../../../sdk/github/types.ts";
import { bold, timestamp, userMention } from "../../discord/textFormatting.ts";
import { getPullRequestThreadId } from "../../kv.ts";
import getUserByGithubUsername from "../../user/getUserByGithubUsername.ts";

export default async function onReviewRequested(
  props: WebhookEvent<"pull-request-review-requested">,
  project: Project,
  ctx: AppContext,
) {
  const bot = ctx.discord.bot;
  const { pull_request, repository, requested_reviewer, sender } = props;

  const seconds = Math.floor(
    new Date(pull_request.created_at).getTime() / 1000,
  );

  const requestedUser = requested_reviewer?.login &&
    await getUserByGithubUsername({
      username: requested_reviewer?.login,
    }, ctx);

  const threadId = await getPullRequestThreadId(`${pull_request.id}`) ||
    project.discord.pr_channel_id;

  await sendMessage(bot, threadId, {
    content: `${
      bold(
        `${sender.login} pediu para ${
          (requestedUser ? userMention(requestedUser.discordId) : "") ||
          requested_reviewer?.login || "alguém"
        } revisar um PR`,
      )
    }\n${bold(`(${repository.full_name})`)} [${
      bold(`#${pull_request.number} - ${pull_request.title}`)
    }](<${pull_request.html_url}>) - ${timestamp(seconds, "R")}`,
    allowedMentions: {
      users: requestedUser ? [snowflakeToBigint(requestedUser.discordId)] : [],
    },
  });

  return new Response(null, { status: STATUS_CODE.NoContent });
}
