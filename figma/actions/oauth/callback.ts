import { AppContext } from "../../mod.ts";

interface OAuthCallbackResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
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

  try {
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const response = await client["POST /token"]({}, {
      body: {
        code,
        redirect_uri: finalRedirectUri,
        grant_type: "authorization_code",
      },
      headers: {
        "Authorization": `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthCallbackResponse;

    const currentTime = Math.floor(Date.now() / 1000);

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

    const account = await ctx.invoke["figma"].loaders.oauth.whoami({
      accessToken: tokenData.access_token,
    })
      .then((user: { email: string; handle: string }) =>
        user.email || user.handle
      )
      .catch(console.error) || undefined;

    return { installId, account };
  } catch (_error) {
    return { installId, account: "error oauth" };
  }
}
