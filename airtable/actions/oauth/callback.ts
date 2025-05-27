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
    redirectUri = "https://jonasjesus--mcp.deco.site/oauth/callback",
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ installId: string }> {
  try {
    const missingParams = [];
    if (!code) missingParams.push("code");
    if (!state) missingParams.push("state");
    if (!clientId) missingParams.push("clientId");
    if (!clientSecret) missingParams.push("clientSecret");
    if (!redirectUri) missingParams.push("redirectUri");

    if (missingParams.length > 0) {
      throw new Error(
        `Missing required OAuth parameters: ${missingParams.join(", ")}`,
      );
    }

    if (code.length < 10) {
      throw new Error("Authorization code appears to be too short or invalid");
    }

    const codeVerifier = extractCodeVerifier(state);
    if (!codeVerifier) {
      throw new Error(
        "code_verifier not found in state parameter. PKCE is required for Airtable OAuth.",
      );
    }

    // Create Basic Auth header for client credentials
    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    console.log("Token request details:", {
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_length: code.length,
      code_verifier_length: codeVerifier.length,
    });
    console.log("Using Basic Auth for client credentials");
    console.log("Making request to:", OAUTH_URL_TOKEN);

    const response = await fetch(OAUTH_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: tokenRequestBody,
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange failed:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
    const currentTime = Math.floor(Date.now() / 1000);

    // Salva os tokens no contexto para uso futuro e refresh automático
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

    return { installId };
  } catch (error) {
    console.error("OAuth callback error:", error);
    throw error;
  }
}
