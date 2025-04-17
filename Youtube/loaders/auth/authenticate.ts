import { AppContext } from "../../mod.ts";
import { DEFAULT_AUTH_URL } from "../../utils/constant.ts";
import { getAccessToken, setAccessTokenCookie } from "../../utils/cookieAccessToken.ts";
import type { YoutubeTokenResponse } from "../../utils/types.ts";

export type AuthenticationResult = {
  authorizationUrl: string;
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

  const initialAccessToken = getAccessToken(req);
  
  const authParams = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    access_type: "offline",
    prompt: "consent"
  });
  const authorizationUrl = `${url}?${authParams.toString()}`;

  const accessToken = await getAccessTokenForRequest({
    initialAccessToken,
    code,
    ctx,
    authClient,
    clientId,
    clientSecret: clientSecretString,
    redirectUri
  });
  
  return {
    authorizationUrl,
    accessToken,
  };
}

async function getAccessTokenForRequest({
  initialAccessToken,
  code,
  ctx,
  authClient,
  clientId,
  clientSecret,
  redirectUri
}: {
  initialAccessToken: string | null;
  code: string | null;
  ctx: AppContext;
  authClient: AppContext["invoke"]["Youtube"];
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<string | null> {
  if (initialAccessToken) {
    return initialAccessToken;
  }

  if (code) {
    try {
      const tokenData = await exchangeCodeForToken({
        authClient,
        code,
        clientId,
        clientSecret,
        redirectUri
      });
      
      if ("error" in tokenData) {
        return null;
      }

      const newAccessToken = tokenData.access_token;
      setAccessTokenCookie(ctx.response, newAccessToken);
      return newAccessToken;
    } catch (_error) {
      return null;
    }
  }
  
  return null;
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