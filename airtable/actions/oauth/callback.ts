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
    const stateData = JSON.parse(atob(state));
    return stateData.code_verifier || null;
  } catch {
    console.error("Failed to parse state parameter");
    return null;
  }
}

/**
 * @title OAuth Callback
 * @description Exchanges the authorization code for access tokens with PKCE support
 */
export default async function callback(
  props: Props,
  __req: Request,
  _ctx: AppContext,
): Promise<{ installId: string; success: boolean; error?: string }> {
  const { code, state, installId, clientId, clientSecret, redirectUri } = props;
  console.log("callback", props);

  try {
    // Extract code_verifier from state (required for PKCE)
    const codeVerifier = extractCodeVerifier(state);
    if (!codeVerifier) {
      throw new Error(
        "code_verifier not found in state parameter. PKCE is required for Airtable OAuth.",
      );
    }

    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier, // PKCE is now required
    });

    console.log("Token request body:", tokenRequestBody.toString());

    const response = await fetch(OAUTH_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: tokenRequestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Token exchange failed:", errorText);
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;

    // TODO: Store tokens in context configuration when MCP integration is added
    console.log("OAuth tokens received successfully:", {
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      has_refresh_token: !!tokenData.refresh_token,
    });

    return { installId, success: true };
  } catch (error) {
    console.error("OAuth callback error:", error);
    return {
      installId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
