import { OAUTH_SCOPES, OAUTH_URL_AUTH } from "../../utils/constants.ts";

export interface Props {
  /**
   * @title Client ID
   * @description The OAuth client ID from your Airtable app
   */
  clientId: string;

  /**
   * @title Redirect URI
   * @description The URI to redirect to after authorization
   */
  redirectUri: string;

  /**
   * @title State
   * @description A random string to prevent CSRF attacks
   */
  state: string;

  /**
   * @title Code Challenge (optional)
   * @description PKCE code challenge for enhanced security. If not provided, one will be generated automatically.
   */
  codeChallenge?: string;

  /**
   * @title Code Verifier (optional)
   * @description PKCE code verifier. If not provided, one will be generated automatically.
   */
  codeVerifier?: string;
}

// Function to generate a random code verifier for PKCE
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// Function to generate code challenge from verifier
async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * @title Start OAuth Flow
 * @description Redirects to Airtable's OAuth authorization page with PKCE support
 */
export default async function start(props: Props) {
  console.log("start", props);

  // Generate PKCE parameters if not provided (Airtable requires PKCE)
  let codeVerifier = props.codeVerifier;
  let codeChallenge = props.codeChallenge;

  if (!codeVerifier) {
    codeVerifier = generateCodeVerifier();
  }

  if (!codeChallenge) {
    codeChallenge = await generateCodeChallenge(codeVerifier);
  }

  console.log("Generated code_verifier:", codeVerifier);
  console.log("Generated code_challenge:", codeChallenge);

  // Include code_verifier in state for callback use
  let enhancedState: string;
  try {
    const stateData = JSON.parse(atob(props.state));
    stateData.code_verifier = codeVerifier;
    enhancedState = btoa(JSON.stringify(stateData));
  } catch {
    // If state is not base64 JSON, create new structure
    enhancedState = btoa(JSON.stringify({
      original_state: props.state,
      code_verifier: codeVerifier,
    }));
  }

  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPES.join(" "),
    state: enhancedState,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;
  console.log("Authorization URL:", authorizationUrl);

  return Response.redirect(authorizationUrl);
}
