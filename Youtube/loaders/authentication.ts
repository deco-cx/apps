import type { AppContext } from "../mod.ts";
import  { getAccessToken, setAccessTokenCookie } from "../utils/cookieAccessToken.ts";
import type { YoutubeTokenResponse } from "../utils/types.ts";

// Constantes
const DEFAULT_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export type AuthenticationResult = {
  user: {
    login: string;
    avatar_url: string;
  };
  authorizationUrl: string;
  channelData: unknown;
  accessToken: string | null;
};

export type AuthenticationError = {
  message: string;
  error: boolean;
};

type AuthenticationResponse = AuthenticationResult | AuthenticationError;

/**
 * @title Youtube Authentication
 * @description Authenticate the user with the Youtube API
 */
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuthenticationResponse> {
  const urlParams = new URL(req.url).searchParams;
  const code = urlParams.get("code");
  const { authClient, authenticationConfig } = ctx;
  const { clientId, redirectUri, scopes, clientSecret } = authenticationConfig;
  const clientSecretString =  typeof clientSecret === "string" ? clientSecret : clientSecret?.get?.() ?? "";

  const { url = DEFAULT_AUTH_URL } = authenticationConfig;

  if (!clientId) return { message: "clientId is required", error: true };
  if (!redirectUri) return { message: "redirectUri is required", error: true };
  if (!scopes) return { message: "scopes is required", error: true };

  let channelData = null;
  let accessToken = getAccessToken(req);
  
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent"
  });
  const authorizationUrl = `${url}?${authParams.toString()}`;

  if (!accessToken && code) {
    try {
      const tokenData = await exchangeCodeForToken({
        authClient,
        code,
        clientId,
        clientSecret: clientSecretString,
        redirectUri
      });
      
      if ("error" in tokenData) {
        return tokenData;
      }

      setAccessTokenCookie(ctx.response, tokenData.access_token);
      accessToken = tokenData.access_token;

      channelData = await ctx.invoke.Youtube.loaders.channels({
        accessToken,
      });
    } catch (_error) {
      return { message: "Erro ao obter token de acesso", error: true };
    }
  } else if (accessToken) {
      channelData = await ctx.invoke.Youtube.loaders.channels({
        accessToken,
      });
  }

  const user = {
    login: accessToken ? "YouTube User" : "Visitante",
    avatar_url: channelData?.items?.[0]?.snippet?.thumbnails?.default?.url ?? "",
  };

  return {
    user,
    authorizationUrl,
    channelData,
    accessToken,
  };
}

async function exchangeCodeForToken({
  authClient,
  code, 
  clientId, 
  clientSecret,
  redirectUri,
}: {
  authClient: AppContext["invoke"]["Youtube"],
  code: string, 
  clientId: string, 
  clientSecret: string,
  redirectUri: string
}): Promise<YoutubeTokenResponse | AuthenticationError> {
  
  const tokenResponse = await authClient[`POST /token`](
    {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    }
  );
  
  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    return { message: errorText, error: true };
  }
  
  return await tokenResponse.json() as YoutubeTokenResponse;
}