import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constant.ts";

export interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
}

/**
 * @title Iniciar OAuth
 * @description Gera a URL de autorização do Google para iniciar o fluxo OAuth
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

  const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
