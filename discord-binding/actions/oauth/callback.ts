import { AppContext } from "../../mod.ts";

interface OAuthCallbackResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
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
 * @title OAuth Discord Callback
 * @description Exchanges the authorization code for access tokens
 */
export default async function callback(
  { code, installId, clientId, clientSecret, redirectUri }: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ installId: string }> {
  const { client } = ctx;

  const finalRedirectUri = redirectUri ||
    new URL("/oauth/callback", req.url).href;

  const response = await client["POST /oauth2/token"]({}, {
    body: {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: finalRedirectUri,
    },
  });

  const tokenData = await response.json() as OAuthCallbackResponse;
  const currentTime = Math.floor(Date.now() / 1000);

  ctx.tokens = {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_in: tokenData.expires_in,
    scope: tokenData.scope,
    token_type: tokenData.token_type,
    tokenObtainedAt: currentTime,
  };

  const currentCtx = await ctx.getConfiguration();
  await ctx.configure({
    ...currentCtx,
    tokens: ctx.tokens,
    clientSecret: clientSecret,
    clientId: clientId,
  });

  return { installId };
}
