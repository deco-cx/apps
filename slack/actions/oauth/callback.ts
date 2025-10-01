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
  /**
   * @title State
   * @description OAuth state parameter
   */
  state?: string;
}

function decodeState(state: string) {
  try {
    const decoded = atob(decodeURIComponent(state));
    return JSON.parse(decoded);
  } catch {
    return {};
  }
}

/**
 * @name SLACK_OAUTH_CALLBACK
 * @title Slack OAuth Callback
 * @description Exchanges the authorization code for access tokens
 */
export default async function callback(
  { code, installId, clientId, clientSecret, redirectUri, botName, state }:
    Props,
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

  // Check if this is a custom bot from state
  const finalClientId = clientId;
  let finalClientSecret = clientSecret;
  let finalBotName = botName;

  if (state) {
    const stateData = decodeState(state);
    if (stateData.isCustomBot) {
      finalClientSecret = stateData.customClientSecret || clientSecret;
      finalBotName = stateData.customBotName || botName;
    }
  }

  const body = new URLSearchParams({
    code,
    client_id: finalClientId,
    client_secret: finalClientSecret,
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
  const effectiveBotName = finalBotName ?? currentCtx?.customBotName ??
    "deco.chat";

  await ctx.configure({
    ...currentCtx,
    botUserId: tokenData.bot_user_id,
    botToken: tokenData.access_token, // Bot token for API calls
    userToken: tokenData.authed_user.access_token, // User token if needed
    teamId: tokenData.team.id,
    clientSecret: finalClientSecret,
    clientId: finalClientId,
    // Add custom bot info
    customBotName: effectiveBotName,
    tokens: {
      access_token: tokenData.access_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      tokenObtainedAt: currentTime,
    },
  });

  const displayName = `${effectiveBotName} | ${tokenData.team.name}`;

  return {
    installId,
    name: displayName,
    botInfo: {
      id: tokenData.bot_user_id,
      appId: tokenData.app_id,
      name: effectiveBotName,
    },
  };
}
