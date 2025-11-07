import { AppContext } from "../../mod.ts";
import { GITHUB_URL_OAUTH_ACCESS_TOKEN } from "../../utils/constant.ts";

interface Props {
  installId?: string;
  code: string;
  redirectUri: string;
  clientSecret: string;
  clientId: string;
}

export default async function callback(
  { code, redirectUri, clientSecret, clientId, installId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  installId?: string;
  account?: string;
}> {
  const currentCtx = await ctx.getConfiguration();
  const response = await fetch(`${GITHUB_URL_OAUTH_ACCESS_TOKEN}`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const authResponse = await response.json();

  await ctx.configure({
    ...currentCtx,
    access_token: authResponse.access_token,
    scope: authResponse.scope,
    token_type: authResponse.token_type,
  });

  const account = await ctx.invoke.github.loaders.getAuthenticatedUser({
    accessToken: authResponse.access_token,
  })
    .then((user) => user.data.login)
    .catch(console.error) || undefined;

  return {
    installId,
    account,
  };
}
