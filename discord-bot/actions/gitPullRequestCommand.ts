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

  const bot_token = discord_bot_token.get();

  if (!bot_token) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Bot token not found",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

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

  if (openPRs === undefined) {
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
    token: bot_token,
  });

  const thread = await startThreadWithoutMessage(bot, channel_id, {
    name: `Opened PRs at ${organization}/${repo}`,
    autoArchiveDuration: 4320,
    type: ChannelTypes.PublicThread,
  });

  await Promise.all(
    openPRs.map(async (pr) =>
      await sendPRMessageOnDiscord(
        { channelID: String(thread.id), pr, bot },
        ctx,
      )
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
  const bot_token = discord_bot_token.get();

  if (!bot_token) {
    return new Response(
      JSON.stringify({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: "Bot token not found",
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }

  const assign = pr.reviewers?.map((rev) =>
    `<@${getDiscordUsers(usersFromGitToDiscord, rev.login) ?? rev.login}>`
  ).join(", ");

  if (bot === undefined) {
    bot = await createBot({
      token: bot_token,
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
): Promise<PullRequest[] | undefined> => {
  const git_token = octokit_token.get();
  if (!git_token) {
    return undefined;
  }

  const activePulls = await GithubClient.getAllActivePulls(
    organization,
    repo,
    git_token,
  ).catch(
    (err) => {
      console.log("error");
      if ((err as { status: number })?.status === 404) {
        return undefined;
      }
      throw err;
    },
  );

  const prs = activePulls?.map((pr) => ({
    url: pr.html_url,
    state: pr.state,
    title: pr.title,
    owner: pr.user?.login ?? "",
    reviewers: pr.requested_reviewers?.map((rev) => ({
      login: rev.login,
    })) ?? [],
  }));

  return prs;
};

export default PullRequestsBot;
