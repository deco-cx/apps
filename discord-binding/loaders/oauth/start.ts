export interface Props {
  clientId: string;
  redirectUri: string;
  state: string;
}

/**
 * @name OAUTH_START
 * @title Start OAuth Discord
 * @description Starts the Discord OAuth authorization flow
 */
export default function start(props: Props) {
  const authParams = new URLSearchParams({
    client_id: props.clientId,
    redirect_uri: props.redirectUri,
    response_type: "code",
    scope:
      "dm_channels.messages.read+messages.read+dm_channels.messages.write+voice+rpc.notifications.read",
    state: props.state,
    prompt: "consent",
  });

  const authorizationUrl =
    `https://discord.com/api/oauth2/authorize?${authParams.toString()}`;

  return Response.redirect(authorizationUrl);
}
