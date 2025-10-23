import { SCOPES } from "../../utils/constant.ts";

export interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
}

/**
 * @name OAUTH_START
 * @title Start OAuth Google
 * @description Starts the Google OAuth authorization flow
 */
export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: props.state,
  });

  const authorizationUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
