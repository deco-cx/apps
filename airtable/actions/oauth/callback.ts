import type { AppContext } from "../../mod.ts";
import { OAUTH_URL_TOKEN } from "../../utils/constants.ts";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
}

export interface Props {
  /**
   * @title Authorization Code
   * @description The authorization code received from Airtable
   */
  code: string;

  /**
   * @title State
   * @description The state parameter returned from authorization (contains code_verifier)
   */
  state: string;

  /**
   * @title Install ID
   * @description Unique identifier for this installation
   */
  installId: string;

  /**
   * @title Client ID
   * @description The OAuth client ID from your Airtable app
   */
  clientId: string;

  /**
   * @title Client Secret
   * @description The OAuth client secret from your Airtable app
   * @format password
   */
  clientSecret: string;

  /**
   * @title Redirect URI
   * @description The same redirect URI used in the authorization request
   */
  redirectUri: string;
}

// Function to extract code_verifier from state
function extractCodeVerifier(state: string): string | null {
  try {
    console.log("Attempting to parse state:", state);
    const stateData = JSON.parse(atob(state));
    console.log("Parsed state data:", stateData);
    const codeVerifier = stateData.code_verifier || null;
    console.log(
      "Extracted code_verifier:",
      codeVerifier ? "found" : "not found",
    );
    return codeVerifier;
  } catch (error) {
    console.error("Failed to parse state parameter:", error);
    return null;
  }
}

/**
 * @title OAuth Callback
 * @description Exchanges the authorization code for access tokens with PKCE support
 */
export default async function callback(
  {
    code,
    state,
    installId,
    clientId,
    clientSecret,
    redirectUri,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ installId: string; error?: string; account?: string }> {
  try {
    const uri = redirectUri || new URL("/oauth/callback", _req.url).href;

    const codeVerifier = extractCodeVerifier(state);
    if (!codeVerifier) {
      throw new Error(
        "code_verifier not found in state parameter. PKCE is required for Airtable OAuth.",
      );
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: uri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(OAUTH_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: tokenRequestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange failed:", {
        tokenRequestBody,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
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

    const account = await ctx.invoke.airtable.loaders.whoami({
      accessToken: tokenData.access_token,
    })
      .then((user) => user.email)
      .catch(console.error) || undefined;

    return { installId, account };
  } catch (error) {
    console.error("OAuth callback error:", error);
    return {
      installId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
