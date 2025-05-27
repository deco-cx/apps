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
   * @description PKCE code challenge for enhanced security
   */
  codeChallenge?: string;
}

/**
 * @title Start OAuth Flow
 * @description Redirects to Airtable's OAuth authorization page
 */
export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: OAUTH_SCOPES.join(" "),
    state: props.state,
  });

  // Add PKCE code challenge if provided
  if (props.codeChallenge) {
    authParams.set("code_challenge", props.codeChallenge);
    authParams.set("code_challenge_method", "S256");
  }

  const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
