import { AppContext } from "../../mod.ts";
import { SlackOAuthResponse } from "../../utils/client.ts";
import {
  decodeCustomBotState,
  invalidateSession,
  retrieveCustomBotSession,
} from "../../utils/state-helpers.ts";

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

  // SECURITY: Retrieve credentials using session token, never from state
  const finalClientId = clientId;
  let finalClientSecret = clientSecret;
  let finalBotName = botName;
  let finalDebugMode = false;

  if (state) {
    const stateData = decodeCustomBotState(state);

    // Handle debugMode from state (for deco.chat bot)
    if (stateData.debugMode) {
      finalDebugMode = true;
    }

    if (stateData.isCustomBot && stateData.sessionToken) {
      // Retrieve credentials securely using session token
      const credentials = retrieveCustomBotSession(stateData.sessionToken);

      if (credentials) {
        finalClientSecret = credentials.clientSecret;
        finalBotName = credentials.botName || stateData.customBotName ||
          botName;
        finalDebugMode = credentials.debugMode || false;

        // Invalidate session token after successful retrieval
        invalidateSession(stateData.sessionToken);
      } else {
        throw new Error("Invalid or expired session token in OAuth callback");
      }
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
    debugMode: finalDebugMode,
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
