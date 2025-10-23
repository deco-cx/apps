# How to integrate with an Oauth Service

## Requisits

Two env vars which will hold the oAuth app information:

- {PROVIDER_NAME}_CLIENT_ID
- {PROVIDER_NAME}_CLIENT_SECRET

- You have to create two functions. A loaders/oauth/start.ts which will redirect
  the user to the correct oauth login URL.

## loaders/oauth/start.ts

<ExampleOauthStart>
import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constant.ts";

export interface Props { clientId: string; redirectUri: string; state: string; }

export default function start(props: Props) { const authParams = new
URLSearchParams({ client_id: props.clientId, redirect_uri: props.redirectUri,
response_type: "code", scope: SCOPES.join(" "), access_type: "offline", prompt:
"consent", state: props.state, });

const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;

return Response.redirect(authorizationUrl); }
</ExampleOauthStart>

And a actions/oauth/callback.ts which will handle the flow after the user has
successfully authorized the app

## actions/oauth/callback.ts

<ExampleOauthCallback>
Example Code:

import { AppContext } from "../../mod.ts";

interface OAuthCallbackResponse { access_token: string; expires_in: number;
refresh_token: string; scope: string; token_type: string; }

export interface Props { code: string; installId: string; clientId: string;
clientSecret: string; redirectUri: string; }

/**

- @name OAUTH_CALLBACK
- @title OAuth Callback
- @description Exchanges the authorization code for access tokens */ export
  default async function callback( { code, installId, clientId, clientSecret,
  redirectUri }: Props, req: Request, ctx: AppContext, ): Promise<{ installId:
  string }> { const { client } = ctx;

const finalRedirectUri = redirectUri || new URL("/oauth/callback",
req.url).href;

const response = await client["POST /token"]({ code, client_id: clientId,
client_secret: clientSecret, redirect_uri: finalRedirectUri, grant_type:
"authorization_code", });

const tokenData = await response.json() as OAuthCallbackResponse; const
currentTime = Math.floor(Date.now() / 1000);

client.oauth.tokens.access_token = tokenData.access_token;
client.oauth.tokens.refresh_token = tokenData.refresh_token;
client.oauth.tokens.expires_in = tokenData.expires_in; client.oauth.tokens.scope
= tokenData.scope; client.oauth.tokens.token_type = tokenData.token_type;
client.oauth.tokens.tokenObtainedAt = currentTime;

const currentCtx = await ctx.getConfiguration(); await ctx.configure({
...currentCtx, tokens: { access_token: tokenData.access_token, refresh_token:
tokenData.refresh_token, expires_in: tokenData.expires_in, scope:
tokenData.scope, token_type: tokenData.token_type, tokenObtainedAt: currentTime,
}, clientSecret: clientSecret, clientId: clientId, });

return { installId }; }
</ExampleOauthCallback>

After those two functions are created, you must modify the app's mod.ts to
actually create the oAuth client accordingly.

Here's an example mod.ts for oauth

<ExampleModTsOauth>
import { createOAuthHttpClient } from "../mcp/utils/httpClient.ts";
import manifest, { Manifest } from "./manifest.gen.ts";
import type { FnContext } from "@deco/deco";
import { McpContext } from "../mcp/context.ts";
import {
  API_URL,
  OAUTH_URL,
  OAUTH_URL_AUTH,
  SCOPES,
} from "./utils/constant.ts";
import { AuthClient, Client } from "./utils/client.ts";
import {
  DEFAULT_OAUTH_HEADERS,
  OAuthClientOptions,
  OAuthClients,
  OAuthProvider,
  OAuthTokens,
} from "../mcp/oauth.ts";

export const GoogleProvider: OAuthProvider = { name: "Google", authUrl:
OAUTH_URL_AUTH, tokenUrl: OAUTH_URL, scopes: SCOPES, clientId: "", clientSecret:
"", };

export interface Props { tokens?: OAuthTokens; clientSecret?: string; clientId?:
string; }

export interface State extends Props { client: OAuthClients<Client, AuthClient>;
}

export type AppContext = FnContext<State & McpContext<Props>, Manifest>;

/**

- @title Google Gmail
- @description Integração com Google Gmail usando OAuth 2.0 com refresh
  automático de tokens
- @category Produtividade
- @logo
  https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/1024px-Gmail_icon_%282020%29.svg.png
  */ export default function App( props: Props, _req: Request, ctx?:
  McpContext<Props>, ) { const { tokens, clientId, clientSecret } = props;

const googleProvider: OAuthProvider = { ...GoogleProvider, clientId: clientId ??
"", clientSecret: clientSecret ?? "", };

const options: OAuthClientOptions = { headers: DEFAULT_OAUTH_HEADERS,
authClientConfig: { headers: new Headers({ "Accept": "application/json",
"Content-Type": "application/x-www-form-urlencoded", }), }, };

const client = createOAuthHttpClient<Client, AuthClient>({ provider:
googleProvider, apiBaseUrl: API_URL, tokens, options, onTokenRefresh: async
(newTokens: OAuthTokens) => { if (ctx) { await ctx.configure({ ...ctx, tokens:
newTokens, }); } }, });

const state: State = { ...props, tokens, client, };

return { state, manifest, }; }
</ExampleModTsOauth>

<ExampleConstants>
export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
];

export const API_URL = "https://gmail.googleapis.com"; export const OAUTH_URL =
"https://oauth2.googleapis.com"; export const OAUTH_URL_AUTH =
`https://accounts.google.com/o/oauth2/v2/auth`;
</ExamplesConstants>
