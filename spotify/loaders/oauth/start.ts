import {
  SPOTIFY_OAUTH_AUTHORIZE_URL,
  SPOTIFY_SCOPES,
} from "../../utils/constants.ts";

interface Props {
  /**
   * @title State
   * @description State for CSRF security verification
   */
  state: string;

  /**
   * @title Redirect URI
   * @description URI for redirection after authorization
   */
  redirectUri: string;

  /**
   * @title Client ID
   * @description Spotify application client ID
   */
  clientId: string;

  /**
   * @title Scopes
   * @description Permission scopes requested (optional, uses default if not provided)
   */
  scopes?: string;
}

/**
 * @title OAuth Start
 * @description Start Spotify OAuth2 authorization flow
 */
export default function start(props: Props) {
  const { state, redirectUri, clientId, scopes } = props;

  const finalClientId = clientId || Deno.env.get("SPOTIFY_CLIENT_ID") || "";
  const finalScopes = scopes || SPOTIFY_SCOPES;
  const scopeString = Array.isArray(finalScopes)
    ? finalScopes.join(" ")
    : finalScopes;

  const authParams = new URLSearchParams({
    client_id: finalClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scopeString,
    state: state,
  });

  const authorizationUrl =
    `${SPOTIFY_OAUTH_AUTHORIZE_URL}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
