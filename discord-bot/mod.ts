import type { App as A, AppContext as AC } from "deco/mod.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { Secret } from "../website/loaders/secret.ts";
import workflow from "../workflows/mod.ts";
import { DiscordClient } from "./client.ts";
import { createHttpClient } from "../utils/http.ts";

export type App = ReturnType<typeof DiscordBot>;
export type AppContext = AC<App>;

export interface Repository {
  /**
   * @description Repository's owner
   */
  organization: string;
  /**
   * @description Repository name
   */
  repo: string;
}

export interface User {
  /**
   * @description Git hub user
   */
  github_user: string;
  /**
   * @description Discord user id
   */
  discord_user: string;
}

/**
 * @title discord-bot
 */
export interface Props {
  /**
   * @description Secret create for the git hub webhook under https://github.com/{{organization}}/{{repo}}/settings/hooks
   */
  git_hub_webhook_secret: Secret;
  /**
   * @description Octokit token necessary to retrieve git hub informations from your repositories
   */
  octokit_token: Secret;
  /**
   * @description Discord channel where the bot will send the recurrent messages
   */
  discord_channel_id: string;
  /**
   * @description Public key provided by discord when you create your bot: https://discord.com/developers/applications/{{your_bot_id}}/information
   */
  discord_bot_public_key: string;
  /**
   * @description App ID provided by discord when you create your bot: https://discord.com/developers/applications/{{your_bot_id}}/information
   */
  discord_bot_app_id: string;
  /**
   * @description Token provided by discord to identify your bot when this app is communicating with discord APIs: https://discord.com/developers/applications/{{your_bot_id}}/bot
   */
  discord_bot_token: Secret;
  /**
   * @description List with all repositories to watch
   */
  repositories: Repository[];
  /**
   * @description Users mapping from git to discord, necessary to tag members on discord's threads
   */
  usersFromGitToDiscord?: User[];
}

export default function DiscordBot(
  props: Props,
) {
  const {
    discord_bot_app_id,
    discord_bot_token,
  } = props;

  const headers = new Headers();
  headers.set("Authorization", `Bot ${discord_bot_token}`);
  headers.set("Content-Type", "application/json; charset=UTF-8");
  headers.set(
    "User-Agent",
    "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
  );

  const discordClient = createHttpClient<DiscordClient>({
    base: `https://discord.com/api/v10/applications/${discord_bot_app_id}/`,
    headers: headers,
  });

  const state = {
    ...props,
    discordClient,
  };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}
