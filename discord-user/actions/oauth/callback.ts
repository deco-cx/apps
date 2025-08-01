import { AppContext } from "../../mod.ts";
import { OAUTH_URL } from "../../utils/constant.ts";

interface OAuthCallbackResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface User {
  email: string;
}

export interface Props {
  code: string;
  installId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

/**
 * @name OAUTH_CALLBACK
 * @title OAuth Callback
 * @description Exchanges the authorization code for access tokens
 */
export default async function callback(
  { code, installId, clientId, clientSecret, redirectUri }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ installId: string; account?: string }> {
  const { client } = ctx;

  const finalRedirectUri = redirectUri ||
    new URL("/oauth/callback", req.url).href;

  const response = await fetch(OAUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: finalRedirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await response.json() as OAuthCallbackResponse;
  const currentTime = Math.floor(Date.now() / 1000);

  client.oauth.tokens.access_token = tokenData.access_token;
  client.oauth.tokens.refresh_token = tokenData.refresh_token;
  client.oauth.tokens.expires_in = tokenData.expires_in;
  client.oauth.tokens.scope = tokenData.scope;
  client.oauth.tokens.token_type = tokenData.token_type;
  client.oauth.tokens.tokenObtainedAt = currentTime;

  const currentCtx = await ctx.getConfiguration();
  await ctx.configure({
    ...currentCtx,
    tokens: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      tokenObtainedAt: currentTime,
    },
    clientSecret: clientSecret,
    clientId: clientId,
  });

  const account = await ctx.invoke["discord-user"].loaders.oauth.whoami({
    accessToken: tokenData.access_token,
  });

  return { installId, account: account.username };
}
