import { SCOPES } from "../../utils/constant.ts";

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
    access_type: "offline",
    prompt: "consent",
    state: props.state,
  });

  const authorizationUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
