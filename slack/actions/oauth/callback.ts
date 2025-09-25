import { AppContext } from "../../mod.ts";
import { SlackOAuthResponse } from "../../utils/client.ts";

export interface Props {
  code: string;
  installId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  /**
   * @title Bot Name
   * @description Custom bot identifier
   */
  botName?: string;
}

/**
 * @name SLACK_OAUTH_CALLBACK
 * @title Slack OAuth Callback
 * @description Exchanges the authorization code for access tokens
 */
export default async function callback(
  { code, installId, clientId, clientSecret, redirectUri, botName }: Props,
  req: Request,
  ctx: AppContext,
): Promise<
  {
    installId: string;
    name: string;
    botInfo?: { id: string; appId: string; name: string };
  }
> {
  const finalRedirectUri = redirectUri ||
    new URL("/oauth/callback", req.url).href;

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: finalRedirectUri.replace("http://", "https://"),
  });
  // Exchange code for tokens using Slack's oauth.v2.access endpoint
  const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const tokenData = await tokenResponse.json() as SlackOAuthResponse;

  if (!tokenData.ok) {
    throw new Error(`Slack OAuth error: ${JSON.stringify(tokenData)}`);
  }

  const currentTime = Math.floor(Date.now() / 1000);

  // Get current configuration and update with new tokens
  const currentCtx = await ctx.getConfiguration();
  const effectiveBotName = botName ?? currentCtx?.customBotName;

  await ctx.configure({
    ...currentCtx,
    botUserId: tokenData.bot_user_id,
    botToken: tokenData.access_token, // Bot token for API calls
    userToken: tokenData.authed_user.access_token, // User token if needed
    teamId: tokenData.team.id,
    clientSecret: clientSecret,
    clientId: clientId,
    // Add custom bot info
    customBotName: effectiveBotName ?? "deco.chat",
    appInfo: {
      id: tokenData.app_id,
      name: effectiveBotName ?? currentCtx?.appInfo?.name ??
        tokenData.team.name,
    },
    tokens: {
      access_token: tokenData.access_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      tokenObtainedAt: currentTime,
    },
  });

  return {
    installId,
    name: `${effectiveBotName || "Slack"} | ${tokenData.team.name}`,
    botInfo: {
      id: tokenData.bot_user_id,
      appId: tokenData.app_id,
      name: effectiveBotName || "deco.chat",
    },
  };
}
