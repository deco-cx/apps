import { AppContext } from "../../mod.ts";
import { DEFAULT_AUTH_URL } from "../../utils/constant.ts";
import { getAccessToken, setAccessTokenCookie } from "../../utils/cookieAccessToken.ts";
import type { YoutubeTokenResponse } from "../../utils/types.ts";

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

  const channelData = await getChannelData({
    accessToken,
    ctx,
    req
  });

  const avatarUrl = getAvatarUrl(channelData);

  const user = {
    login: accessToken ? "YouTube User" : "Visitante",
    avatar_url: avatarUrl,
  };
  
  return {
    user,
    authorizationUrl,
    channelData,
    accessToken,
  };
}

function getAvatarUrl(channelData: unknown): string {
  if (!channelData || typeof channelData !== 'object') {
    return "";
  }
  
  try {
    // @ts-ignore - Tratamos as propriedades do channelData de forma segura em runtime
    const items = (channelData as any).items;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "";
    }
    
    const channel = items[0];
    if (!channel || typeof channel !== 'object') {
      return "";
    }
    
    const snippet = channel.snippet;
    if (!snippet || typeof snippet !== 'object') {
      return "";
    }
    
    const thumbnails = snippet.thumbnails;
    if (!thumbnails || typeof thumbnails !== 'object') {
      return "";
    }
    
    const defaultThumb = thumbnails.default;
    if (!defaultThumb || typeof defaultThumb !== 'object') {
      return "";
    }
    
    return defaultThumb.url || "";
  } catch {
    return "";
  }
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
  // Se já temos um token, simplesmente o retornamos
  if (initialAccessToken) {
    return initialAccessToken;
  }
  
  // Se não temos token, mas temos código de autorização, obtemos um novo token
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
  
  // Não temos nem token nem código
  return null;
}

async function getChannelData({
  accessToken,
  ctx,
  req
}: {
  accessToken: string | null;
  ctx: AppContext;
  req: Request;
}): Promise<unknown> {
  if (!accessToken) {
    return null;
  }
  
  try {
    // Seleciona qual endpoint chamar dependendo do URL do pedido
    const isNewRequest = new URL(req.url).searchParams.has("code");
    
    if (isNewRequest) {
      return await ctx.invoke.Youtube.loaders.channels({
        accessToken,
      });
    } else {
      return await ctx.invoke.Youtube.loaders.channels.get({
        accessToken,
      });
    }
  } catch (_error) {
    return null;
  }
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