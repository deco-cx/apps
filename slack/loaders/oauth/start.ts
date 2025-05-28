import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constants.ts";

export interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
}

export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri.replace("http", "https"),
    response_type: "code",
    scope: SCOPES.join(","),
    state: props.state,
  });

  const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
