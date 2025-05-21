import { GITHUB_URL_OAUTH_AUTHORIZE, SCOPES } from "../../utils/constant.ts";

interface Props {
  state: string;
  redirectUri: string;
  clientId: string;
  scopes?: string;
}

export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: props.scopes || SCOPES,
    state: props.state,
  });

  const authorizationUrl =
    `${GITHUB_URL_OAUTH_AUTHORIZE}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
