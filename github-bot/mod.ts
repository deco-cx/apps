import type {
  App as A,
  AppContext as AC,
  AppMiddlewareContext as AMC,
  ManifestOf,
} from "@deco/deco";
import type { Secret } from "../website/loaders/secret.ts";
import workflow from "../workflows/mod.ts";
import { Octokit } from "./deps/deps.ts";
import { Bot, createBot } from "./deps/discordeno.ts";
import manifest, { type Manifest } from "./manifest.gen.ts";
import { GithubClient } from "./sdk/github/client.ts";
import type { ProjectUser } from "./types.ts";

export type App = ReturnType<typeof GithubBot>;
export type AppContext = AC<App>;
export type AppMiddlewareContext = AMC<App>;
export type AppManifest = ManifestOf<App>;

interface GithubProps {
  /**
   * @title Webhook Secret
   * @description Secret create for the git hub webhook under https://github.com/{{organization}}/{{repo}}/settings/hooks
   */
  webhook_secret: Secret;
  /**
   * @title Organization Name
   */
  org_name: string;
  /**
   * @title Repository Name
   */
  repo_name: string;
}

interface DiscordProps {
  /**
   * @title Pull Request Channel ID
   * @description Discord channel where the bot will send the recurrent messages about pull requests
   */
  pr_channel_id: string;
  /**
   * @title Summary Channel ID
   * @description Discord channel where the bot will send the recurrent messages about pull requests summary
   */
  summary_channel_id: string;
}

interface DiscordApplicationsProps {
  /**
   * @title Public Key
   * @description Public key provided by discord when you create your bot: https://discord.com/developers/applications/{{your_bot_id}}/information
   */
  public_key: string;
  /**
   * @title App ID
   * @description App ID provided by discord when you create your bot: https://discord.com/developers/applications/{{your_bot_id}}/information
   */
  app_id: string;
  /**
   * @title Token
   * @description Token provided by discord to identify your bot when this app is communicating with discord APIs: https://discord.com/developers/applications/{{your_bot_id}}/bot
   */
  token: Secret;
}

/**
 * @title {{github.org_name}}/{{github.repo_name}}
 */
export interface Project {
  github: GithubProps;
  discord: DiscordProps;
  /**
   * @description Users that are working on this project
   */
  users: ProjectUser[];
  /**
   * @title Active
   * @description If the project is active or not
   * @default true
   */
  active: boolean;
}

interface Props {
  projects: Project[];
  discord: DiscordApplicationsProps;
  /**
   * @title Github Token
   * @description Octokit token necessary to retrieve github information from your repositories
   */
  githubToken: Secret;
  /**
   * @title Cron Job Secret
   * @description Secret to validate requests from cronjobs
   */
  cronJobSecret: Secret;
  /**
   * @description Enable this to create a workflow to make people confirm they will review the pull request
   * @default false
   */
  confirmPullRequestReview?: boolean;
}

/**
 * @title Github Automation
 * @description App to send notifications about pull requests and issues to Discord
 * @category Automation
 */
export default function GithubBot(props: Props) {
  const { discord, projects, githubToken } = props;

  if (!discord.token?.get() || !projects.length || !githubToken?.get()) {
    return {
      state: {
        ...props,
        githubClient: {} as GithubClient,
        discord: {
          ...discord,
          bot: {} as Bot,
        },
      },
      manifest,
    };
  }

  const discordBot = createBot({
    token: discord.token.get()!,
  });

  const githubClient = new GithubClient(
    new Octokit({
      auth: githubToken.get(),
    }),
  );

  const state = {
    ...props,
    githubClient,
    discord: {
      ...discord,
      bot: discordBot,
    },
  };

  const app: A<Manifest, typeof state, [ReturnType<typeof workflow>]> = {
    state,
    manifest,
    dependencies: [workflow({})],
  };

  return app;
}

export { Preview } from "./preview/Preview.tsx";
