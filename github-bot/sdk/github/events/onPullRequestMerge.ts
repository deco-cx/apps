import { STATUS_CODE } from "@std/http";
import {
  editChannel,
  sendMessage,
  snowflakeToBigint,
} from "../../../deps/discordeno.ts";
import type { AppContext, Project } from "../../../mod.ts";
import type { WebhookEvent } from "../../../sdk/github/types.ts";
import { bold } from "../../discord/textFormatting.ts";
import { deletePullRequestThreadId, getPullRequestThreadId } from "../../kv.ts";
import { getRandomItem } from "../../random.ts";

export default async function onPullRequestMerge(
  props: WebhookEvent<"pull-request-closed">,
  project: Project,
  ctx: AppContext,
) {
  const bot = ctx.discord.bot;
  const { pull_request, repository } = props;

  const owner = pull_request.user;
  const mergedBy = props.pull_request.merged_by ?? owner;

  const title = mergedBy.login === owner.login
    ? `${bold(mergedBy.login)} mergeou o próprio PR`
    : `${bold(mergedBy.login)} mergeou o PR feito por ${bold(owner.login)}.`;

  const mergedAt = new Date(
    pull_request.merged_at ?? pull_request.closed_at ??
      pull_request.created_at,
  ).getTime();

  const createdAt = new Date(pull_request.created_at).getTime();
  const diff = mergedAt - createdAt;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const duration: string[] = [];

  if (days > 0) duration.push(`${days} dia${days !== 1 ? "s" : ""}`);
  if (hours > 0) duration.push(`${hours} hora${hours !== 1 ? "s" : ""}`);
  if (minutes > 0) {
    duration.push(`${minutes} minuto${minutes !== 1 ? "s" : ""}`);
  }

  const theChosenOne = getRandomItem(project.users);

  const threadId = await getPullRequestThreadId(`${pull_request.id}`);
  const channelId = threadId || project.discord.pr_channel_id;

  await sendMessage(bot, channelId, {
    content: `${title}\n(${repository.full_name}) [${
      bold(`#${pull_request.number} - ${pull_request.title}`)
    }](<${pull_request.html_url}>)`,
    allowedMentions: {
      users: theChosenOne ? [snowflakeToBigint(theChosenOne.discordId)] : [],
    },
  });

  if (threadId) {
    await editChannel(bot, threadId, {
      archived: true,
    }).catch(console.error);
    await deletePullRequestThreadId(threadId);
  }

  return new Response(null, { status: STATUS_CODE.NoContent });
}
