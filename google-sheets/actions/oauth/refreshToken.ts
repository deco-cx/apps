import { AppContext } from "../../mod.ts";

/**
 * @name REFRESH_TOKEN
 * @title Refresh Google Sheets Token
 * @description Refresh the access token using the existing refresh token
 */
export default async function refreshToken(
  _: unknown,
  _req: Request,
  ctx: AppContext,
) {
  const { authClient, refresh_token: _refresh_token, clientSecret, clientId } = ctx;
  const currentCtx = await ctx.getConfiguration();

  const refresh_token = _refresh_token || currentCtx.refresh_token;
  const client_id = clientId || currentCtx.clientId;
  const client_secret = clientSecret || currentCtx.clientSecret;

  if (!refresh_token) {
    return {
      success: false,
      message: "no refresh token",
    };
  }

  if (!client_id || !client_secret) {
    return {
      success: false,
      message: "no client id or client secret",
    };
  }

  try {
    const response = await authClient[`POST /token`]({
      client_id,
      client_secret,
      refresh_token: refresh_token,
      redirect_uri: new URL("/oauth/callback", _req.url).href,
      grant_type: "refresh_token",
    });

    const refreshResponse = await response.json();

    if (refreshResponse.access_token) {
      const new_refresh_token = refreshResponse.refresh_token || refresh_token;

      await ctx.configure({
        ...currentCtx,
        access_token: refreshResponse.access_token,
        refresh_token: new_refresh_token,
        expires_in: refreshResponse.expires_in,
        scope: refreshResponse.scope || currentCtx.scope,
        token_type: refreshResponse.token_type || currentCtx.token_type,
        tokenObtainedAt: Math.floor(Date.now() / 1000),
      });

      console.log("refreshResponse", refreshResponse);

      return {
        success: true,
        message: "token refreshed",
        expires_in: refreshResponse.expires_in,
      };
    } else {
      return {
        success: false,
        message: "failed to refresh token",
      };
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: `error to refresh token: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}
