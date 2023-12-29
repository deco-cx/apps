import { GithubClient, PullRequest } from "../client.ts";
import {
  Bot,
  ChannelTypes,
  createBot,
  sendMessage,
  startThreadWithoutMessage,
} from "https://deno.land/x/discordeno@18.0.1/mod.ts";
import { AppContext } from "../mod.ts";
import { getDiscordUsers, getOrganization } from "../utils.ts";

export interface Props {
  repo: string;
  channel_id: string;
}

export async function PullRequestsBot(
  { repo, channel_id }: Props,
  _req: Request,
  ctx: AppContext,
  // deno-lint-ignore no-explicit-any
): Promise<any | null> {
  const {
    discord_bot_token,
    discord_channel_id,
    repositories,
  } = ctx;
  const organization = getOrganization(repositories, repo);

  if (organization === null) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Repository not found",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const openPRs = await queryGitOpenedPR(organization, repo, ctx);

  if (openPRs === null) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "No opened pull requests",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!channel_id) {
    channel_id = discord_channel_id;
  }

  //Create the bot
  const bot = await createBot({
    token: discord_bot_token,
  });

  const thread = await startThreadWithoutMessage(bot, channel_id, {
    name: `Opened PRs at ${organization}/${repo}`,
    autoArchiveDuration: 4320,
    type: ChannelTypes.PublicThread,
  });

  await Promise.all(
    openPRs.map(async (pr) =>
      await sendPRMessageOnDiscord({ channelID: thread.id, pr, bot }, ctx)
    ),
  );

  return new Response(
    null,
    { status: 204 },
  );
}

export interface DiscordPRMessage {
  channelID?: string;
  pr: PullRequest;
  bot?: Bot;
}

export async function sendPRMessageOnDiscord(
  { channelID, pr, bot }: DiscordPRMessage,
  {
    discord_bot_token,
    discord_channel_id,
    usersFromGitToDiscord,
  }: AppContext,
) {
  const assign = pr.reviewers?.map((rev) =>
    `<@${getDiscordUsers(usersFromGitToDiscord, rev.login) ?? rev.login}>`
  ).join(", ");

  if (bot === undefined) {
    bot = await createBot({
      token: discord_bot_token,
    });
  }

  if (channelID === undefined) {
    channelID = discord_channel_id;
  }

  await sendMessage(bot, channelID, {
    content: `Title: ${pr.title}\nAssign to: ${assign}`,
    embeds: [{
      title: pr.url,
      "url": pr.url,
      fields: [
        { "name": "Owner", "value": pr.owner },
        { "name": "State", "value": pr.state },
      ],
    }],
  });
}

const queryGitOpenedPR = async (
  organization: string,
  repo: string,
  {
    octokit_token,
  }: AppContext,
): Promise<PullRequest[] | null> => {
  const activePulls = await GithubClient.getAllActivePulls(
    organization,
    repo,
    octokit_token,
  )
    .catch(
      (err) => {
        console.log("error");
        if ((err as { status: number })?.status === 404) {
          return null;
        }
        throw err;
      },
    );

  const prs = activePulls.map((pr) => ({
    url: pr.html_url,
    state: pr.state,
    title: pr.title,
    owner: pr.user.login,
    reviewers: pr.requested_reviewers.map((rev) => ({
      login: rev.login,
    })),
  }));

  return prs;
};

export default PullRequestsBot;
