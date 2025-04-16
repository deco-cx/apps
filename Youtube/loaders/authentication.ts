import { setCookie } from "@std/http";
import type { AppContext } from "../mod.ts";
import getAccessToken from "../utils/getAccessToken.ts";

// Tempo de expiração do cookie - 1 dia em milissegundos
const COOKIE_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

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

export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<AuthenticationResult | AuthenticationError> {
  console.log("init");
  const urlParams = new URL(req.url).searchParams;
  const code = urlParams.get("code");
  const { client, authenticationConfig } = ctx;

  const {redirectUri, clientId, clientSecret, url } = authenticationConfig;
  const scopes = ctx.authenticationConfig?.scopes;
  const clientSecretString = typeof clientSecret === "string"
    ? clientSecret
    : clientSecret?.get?.() ?? "";

  if (!clientId) {
    return {
      message: "clientId is required",
      error: true,
    };
  }
  if (!redirectUri) {
    return {
      message: "redirectUri is required",
      error: true,
    };
  }
  if (!scopes) {
    return {
      message: "scopes is required",
      error: true,
    };
  }

  let channelData = null;
  let accessToken = getAccessToken(req);
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopes,
    state: "state_parameter_passthrough_value",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent",
  });

  const authorizationUrl =`${url}?${params.toString()}`;
  console.log("authorizationUrl", authorizationUrl);
  console.log("accessToken", accessToken);

  if (!accessToken && code) {
    console.log("code", code);
    try {
      // const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/x-www-form-urlencoded",
      //   },
      //   body: new URLSearchParams({
      //     code,
      //     client_id: clientId,
      //     client_secret: clientSecretString,
      //     redirect_uri: redirectUri,
      //     grant_type: "authorization_code",
      //   }),
      // });
      console.log("antes de chamar o client");
      const tokenResponse = await client["POST /token"]({
        code,
        client_id: clientId,
        client_secret: clientSecretString,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      });
      console.log("depois de chamar o client");
      console.log("tokenResponse", tokenResponse);

      const tokenData = await tokenResponse.json();
      accessToken = tokenData.access_token;

      if (accessToken) {
        setCookie(ctx.response.headers, {
          name: "youtube_access_token",
          value: accessToken,
          path: "/",
          expires: new Date(Date.now() + COOKIE_EXPIRATION_TIME),
          httpOnly: true,
          secure: true,
          sameSite: "Lax",
        });

        try {
          const channelResponse = await client["GET /youtube/v3/channels"]({
            part: "snippet",
            mine: true,
          }, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const channelResult = await channelResponse.json();
          channelData = channelResult.items;
        } catch (_) {
          return {
            message: "Erro ao buscar dados do canal:",
            error: true,
          };
        }
      }
    } catch (_) {
      return {
        message: "Erro ao obter token de acesso:",
        error: true,
      };
    }
  } else if (accessToken) {
    try {
      const channelResponse = await client["GET /youtube/v3/channels"]({
        part: "snippet",
        mine: true,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (channelResponse.ok) {
        const channelResult = await channelResponse.json();
        channelData = channelResult.items;
      } else {
        setCookie(ctx.response.headers, {
          name: "youtube_access_token",
          value: "",
          path: "/",
          expires: new Date(0),
        });
      }
    } catch (_) {
      setCookie(ctx.response.headers, {
        name: "youtube_access_token",
        value: "",
        path: "/",
        expires: new Date(0),
        secure: true,
        httpOnly: true,
      });
    }
  }

  const user = {
    login: accessToken ? "Usuário YouTube" : "Visitante",
    avatar_url: "https://example.com/avatar.jpg",
  };

  return {
    user: user,
    authorizationUrl: authorizationUrl,
    channelData,
    accessToken,
  };
}
