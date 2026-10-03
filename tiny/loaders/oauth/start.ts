interface Props {
  state: string;
  redirectUri: string;
}

export default function start(props: Props) {

  const authParams = new URLSearchParams({
    client_id: Deno.env.get("TINY_CLIENT_ID") ?? "",
    redirect_uri: props.redirectUri,
    response_type: "code",
    state: props.state,
  });

  const authorizationUrl =
    `https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/auth?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}