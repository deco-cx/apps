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

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

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
 * @name START_OAUTH_FLOW
 * @title Start OAuth Flow
 * @description Redirects to Airtable's OAuth authorization page with PKCE support
 */
export default async function start(props: Props) {
  let codeVerifier = props.codeVerifier;
  let codeChallenge = props.codeChallenge;

  if (!codeVerifier) {
    codeVerifier = generateCodeVerifier();
  }

  if (!codeChallenge) {
    codeChallenge = await generateCodeChallenge(codeVerifier);
  }

  let enhancedState: string;
  try {
    const stateData = JSON.parse(atob(props.state));
    stateData.code_verifier = codeVerifier;
    enhancedState = btoa(JSON.stringify(stateData));
  } catch {
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

  return Response.redirect(authorizationUrl);
}
