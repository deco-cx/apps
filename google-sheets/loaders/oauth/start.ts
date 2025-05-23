export interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
}

/**
 * @title Start OAuth Google
 * @description Inicia o fluxo de autorização OAuth do Google
 */
export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/spreadsheets",
    access_type: "offline",
    prompt: "consent",
    state: props.state,
  });

  const authorizationUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
