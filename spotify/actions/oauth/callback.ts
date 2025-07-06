import { AppContext } from "../../mod.ts";
import { SPOTIFY_OAUTH_TOKEN_URL } from "../../utils/constants.ts";

interface Props {
  /**
   * @title Install ID
   * @description Installation ID (optional)
   */
  installId?: string;

  /**
   * @title Authorization Code
   * @description Authorization code returned by Spotify
   */
  code: string;

  /**
   * @title Redirect URI
   * @description Redirect URI (must match the one used in start)
   */
  redirectUri: string;

  /**
   * @title Client Secret
   * @description Spotify application client secret
   */
  clientSecret: string;

  /**
   * @title Client ID
   * @description Spotify application client ID
   */
  clientId: string;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
  error?: string;
  error_description?: string;
}

/**
 * @title OAuth Callback
 * @description Process OAuth2 callback and exchange code for tokens
 */
export default async function callback(
  { code, redirectUri, clientSecret, clientId, installId }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  installId?: string;
  account?: string;
}> {
  // Use env vars as fallback
  const finalClientId = clientId || Deno.env.get("SPOTIFY_CLIENT_ID") || "";
  const finalClientSecret = clientSecret ||
    Deno.env.get("SPOTIFY_CLIENT_SECRET") || "";

  if (!finalClientId || !finalClientSecret) {
    throw new Error("Client ID and Client Secret are required");
  }

  const response = await fetch(SPOTIFY_OAUTH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${btoa(`${finalClientId}:${finalClientSecret}`)}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await response.json() as SpotifyTokenResponse;

  if (!response.ok) {
    throw new Error(
      `OAuth error: ${tokenData.error || "Unknown error"} - ${
        tokenData.error_description || ""
      }`,
    );
  }

  // Configure context with new tokens
  await ctx.configure({
    clientId: finalClientId,
    clientSecret: finalClientSecret,
    tokens: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      tokenObtainedAt: Date.now(),
    },
  });

  // Get user information to return account
  let account: string | undefined;
  try {
    // Create a temporary client with the new token to get user info
    const userResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        "Authorization": `${tokenData.token_type} ${tokenData.access_token}`,
        "Accept": "application/json",
      },
    });

    if (userResponse.ok) {
      const user = await userResponse.json();
      account = user.display_name || user.id;
    }
  } catch (error) {
    console.warn("Unable to get user information:", error);
  }

  return {
    installId,
    account,
  };
}
