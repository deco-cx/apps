import { AppContext } from "../../mod.ts";

interface Props {
  installId?: string;
  code: string;
  redirectUri: string;
  clientSecret: string;
  clientId: string;
}

export default async function callback(
  { code, installId, clientSecret, clientId }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { authClient } = ctx;
  const currenteCtx = await ctx.getConfiguration();

  const response = await authClient[`POST /token`]({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: new URL("/oauth/callback", req.url).href,
    grant_type: "authorization_code",
  });

  const authResponse = await response.json();

  await ctx.configure({
    ...currenteCtx,
    code,
    access_token: authResponse.access_token,
    refresh_token: authResponse.refresh_token,
    expires_in: authResponse.expires_in,
    scope: authResponse.scope,
    token_type: authResponse.token_type,
    tokenObtainedAt: Math.floor(Date.now() / 1000),
    clientSecret,
    clientId,
  });

  return {
    installId,
  };
}
