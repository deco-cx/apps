import type { FnContext } from "@deco/deco";
import { Callbacks } from "../mcp/bindings.ts";
import { McpContext } from "../mcp/context.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
} from "../mcp/utils/config.ts";
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import { OAuthProvider, OAuthTokens } from "../mcp/utils/types.ts";
import { SlackClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SlackApiClient, SlackAuthClient } from "./utils/client.ts";
import {
  API_URL,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constants.ts";

export const SlackProvider: OAuthProvider = {
  name: "Slack",
  authUrl: OAUTH_URL_AUTH,
  tokenUrl: OAUTH_URL,
  scopes: SCOPES,
  clientId: "",
  clientSecret: "",
};

export interface SlackWebhookPayload {
  event_id: string;
  type: string;
  user: string;
  bot_id: string;
  event: {
    user: string;
    text: string;
    team: string;
    channel: string;
    ts: string;
    channel_type: string;
  };
}

export interface SlackPermission {
  workspace?: {
    id: string;
    name: string;
  };
  channels?: Array<{
    id: string;
    name: string;
    is_private?: boolean;
  }>;
  allCurrentAndFutureChannels?: boolean;
}

export interface Props {
  tokens?: OAuthTokens;
  clientSecret?: string;
  clientId?: string;
  /**
   * @description Slack Bot User ID
   */
  botUserId?: string;
  /**
   * @description Slack Team/Workspace ID
   */
  teamId?: string;
  /**
   * @description Bot token (for backward compatibility)
   */
  botToken?: string;
  /**
   * @description User token (from OAuth)
   */
  userToken?: string;
  /**
   * @description An url that new messages will be sent to
   */
  webhookUrl?: string;

  /**
   * @title Permission
   * @description Permission to access the Slack API and selected workspace and channels
   */
  permission?: SlackPermission;

  /**
   * @title Account
   * @description The connected Slack account/workspace name
   */
  account?: string;

  /**
   * @title Debug Mode
   * @description Enable debug mode for additional logging
   */
  debugMode?: boolean;

  /**
   * @title Custom Bot Name
   * @description Custom name for the bot in messages
   */
  customBotName?: string;

  /**
   * @description Callbacks for the slack binding
   */
  callbacks?: Callbacks;
}

export interface State extends Props {
  slack: SlackClient;
  slackClientFor: (p: Props) => SlackClient;
  cb: {
    forTeam: (teamId: string, channel: string) => string;
  };
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @appName slack
 * @title Slack
 * @description Send messages and automate actions in Slack channels.
 * @logo https://assets.decocache.com/mcp/f7e005a9-1c53-48f7-989b-955baa422be1/Slack.svg
 */
export default function App(
  appProps: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  // Create OAuth client or fallback to direct token

  const slackClientFor = (props: Props) => {
    const { tokens, clientId, clientSecret } = props;

    const slackProvider: OAuthProvider = {
      ...SlackProvider,
      clientId: clientId ?? "",
      clientSecret: clientSecret ?? "",
    };

    const options: OAuthClientOptions = {
      headers: DEFAULT_OAUTH_HEADERS,
      authClientConfig: {
        headers: new Headers({
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      },
    };
    const client = createOAuthHttpClient<SlackApiClient, SlackAuthClient>({
      provider: slackProvider,
      apiBaseUrl: API_URL,
      tokens,
      options,
      onTokenRefresh: async (newTokens: OAuthTokens) => {
        if (ctx) {
          await ctx.configure({
            ...props,
            tokens: newTokens,
          });
        }
      },
    });
    return new SlackClient(
      props.tokens?.access_token || props.botToken || "",
      client,
    );
  };

  const state: State = {
    ...appProps,
    slack: slackClientFor(appProps),
    slackClientFor,
    cb: {
      forTeam: (teamId: string, channel: string) => {
        return `${teamId}-${channel}`;
      },
    },
  };

  return {
    state,
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
