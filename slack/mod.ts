import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
} from "../mcp/utils/config.ts";
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import {
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/utils/types.ts";
import { SlackClient } from "./client.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import { SlackApiClient, SlackAuthClient } from "./utils/client.ts";
import {
  API_URL,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constants.ts";
import { Callbacks } from "../mcp/bindings.ts";

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
  event: {
    text: string;
    team: string;
    channel: string;
  };
}

export interface Props {
  tokens?: OAuthTokens;
  clientSecret?: string;
  clientId?: string;
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
   * @description Callbacks for the slack binding
   */
  callbacks?: Callbacks;
}

export interface State extends Props {
  client: OAuthClients<SlackApiClient, SlackAuthClient>;
  slack: SlackClient;
  slackClientFor: (p: Props) => SlackClient;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**
 * @name Slack
 * @title Slack OAuth
 * @description Send messages and interact with Slack channels using OAuth 2.0
 * @logo https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/306_Slack_logo-512.png
 */
export default function App(
  props: Props,
  _req: Request,
  ctx?: McpContext<Props>,
) {
  const { tokens, clientId, clientSecret, botToken } = props;

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

  // Create OAuth client or fallback to direct token
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

  // Create Slack client instance
  const slack = new SlackClient(
    tokens?.access_token || botToken || "",
    client,
  );

  const state: State = {
    ...props,
    tokens,
    client,
    slack,
    slackClientFor: (p: Props) => {
      return new SlackClient(
        p.tokens?.access_token || p.botToken || "",
        client,
      );
    },
  };

  return {
    state,
    manifest,
  };
}

// Re-export types from client for convenience
export * from "./client.ts";
