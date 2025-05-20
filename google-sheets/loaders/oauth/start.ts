import { CLIENT_ID, SCOPES } from "../../utils/constant.ts";

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
    access_type: "offline",
    prompt: "consent",
    state: props.state,
  });

  console.log(props.redirectUri);
  const authorizationUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
