import { STATUS_CODE } from "@std/http/status";
import { sendMessage, snowflakeToBigint } from "../../../deps/discordeno.ts";
import { AppContext, Project } from "../../../mod.ts";
import { WebhookEvent } from "../../../sdk/github/types.ts";
import { bold, timestamp, userMention } from "../../discord/textFormatting.ts";
import { getPullRequestThreadId } from "../../kv.ts";

type ReviewState = "commented" | "changes_requested" | "approved";

export default async function onReviewSubmitted(
  props: WebhookEvent<"pull-request-review-submitted">,
  project: Project,
  ctx: AppContext,
) {
  const bot = ctx.discord.bot;
  const { pull_request, repository, review, sender } = props;

  const owner = pull_request.user;
  if (!owner || owner.login === sender.login) {
    return new Response(null, { status: STATUS_CODE.NoContent });
  }

  const ownerDiscordId = project.users.find(
    (user) => user.githubUsername === owner.login,
  )?.discordId;

  const seconds = Math.floor(
    new Date(pull_request.created_at).getTime() / 1000,
  );

  const state = review.state as ReviewState;

  const title = state === "approved"
    ? "aprovou o PR de"
    : state === "changes_requested"
    ? "pediu alterações no PR de"
    : "comentou no PR de";

  const threadId = await getPullRequestThreadId(`${pull_request.id}`) ||
    project.discord.pr_channel_id;

  await sendMessage(bot, threadId, {
    content: `${
      bold(
        `${sender.login} ${title} ${
          ownerDiscordId ? ` ${userMention(ownerDiscordId)}` : owner.login
        }`,
      )
    }\n${bold(`(${repository.full_name})`)} [${
      bold(`#${pull_request.number} - ${pull_request.title}`)
    }](<${pull_request.html_url}>) - ${timestamp(seconds, "R")}`,
    allowedMentions: {
      users: ownerDiscordId ? [snowflakeToBigint(ownerDiscordId)] : [],
    },
  });

  return new Response(null, { status: STATUS_CODE.NoContent });
}
