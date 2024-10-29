import { STATUS_CODE } from "@std/http/status";
import type { WorkflowProps } from "../../../../workflows/actions/start.ts";
import {
  sendMessage,
  snowflakeToBigint,
  startThreadWithMessage,
} from "../../../deps/discordeno.ts";
import type { AppContext, AppManifest, Project } from "../../../mod.ts";
import type { WebhookEvent } from "../../../sdk/github/types.ts";
import { bold, timestamp, userMention } from "../../discord/textFormatting.ts";
import { setPullRequestThreadId } from "../../kv.ts";
import { getRandomItem } from "../../random.ts";
import { isDraft } from "../utils.ts";

export default async function onPullRequestOpen(
  props: WebhookEvent<"pull-request-opened" | "pull-request-edited">,
  project: Project,
  ctx: AppContext,
) {
  const bot = ctx.discord.bot;
  const { pull_request, repository } = props;
  if (isDraft(pull_request.title)) {
    return new Response(null, { status: STATUS_CODE.NoContent });
  }

  const owner = pull_request.user;
  const reviewer = getRandomItem(
    project.users.filter((user) => user.githubUsername !== owner.login),
  );
  const reviewers = project.users.filter((user) =>
    user.githubUsername !== owner.login &&
    user.githubUsername !== reviewer?.githubUsername
  );

  const seconds = Math.floor(
    new Date(pull_request.created_at).getTime() / 1000,
  );
  const channelId = project.discord.pr_channel_id;

  const message = await sendMessage(
    bot,
    channelId,
    {
      content: `${userMention(reviewer.discordId)} | ${
        bold(owner.login)
      } abriu um novo PR\n(${repository.full_name}) [${
        bold(`#${pull_request.number} - ${pull_request.title}`)
      }](<${pull_request.html_url}>) - ${timestamp(seconds, "R")}`,
      allowedMentions: {
        users: reviewer ? [snowflakeToBigint(reviewer.discordId)] : [],
      },
    },
  );

  const thread = await startThreadWithMessage(bot, channelId, message.id, {
    name: `Pull Request: ${pull_request.title}`.slice(0, 100),
    autoArchiveDuration: 1440,
    reason: "Review Pull Request Thread",
  });

  const threadId = thread.id.toString();
  await setPullRequestThreadId(`${pull_request.id}`, threadId);

  if (reviewer && ctx.confirmPullRequestReview) {
    const workflowProps: WorkflowProps<
      "github-bot/workflows/waitForReviewer.ts",
      AppManifest
    > = {
      key: "github-bot/workflows/waitForReviewer.ts",
      id: `review-pr-${message.id}`,
      props: {},
      args: [{
        channelId: threadId,
        reviewer,
        reviewers,
      }],
    };

    await ctx.invoke.workflows.actions.start(workflowProps);
  }

  return new Response(null, { status: STATUS_CODE.NoContent });
}
