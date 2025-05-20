import {
  CLIENT_ID,
  GITHUB_URL_OAUTH_AUTHORIZE,
  SCOPES,
} from "../../utils/constant.ts";

interface Props {
  state: string;
  redirectUri: string;
}

export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: SCOPES,
    state: props.state,
  });

  const authorizationUrl =
    `${GITHUB_URL_OAUTH_AUTHORIZE}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
