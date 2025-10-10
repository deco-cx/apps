import type { AppContext } from "../../mod.ts";
import { SlackOAuthResponse } from "../../utils/client.ts";
import { generateSelectionPage } from "../../utils/ui-templates/page-generator.ts";

export interface Props {
  code: string;
  installId: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  state?: string;
  queryParams?: Record<string, string | boolean | undefined>;
}

interface StateProvider {
  original_state?: string;
}

interface State {
  appName: string;
  installId: string;
  invokeApp: string;
  returnUrl?: string | null;
  redirectUri?: string | null;
  original_state?: string;
}

function decodeState(state: string): State & StateProvider {
  try {
    const decoded = atob(decodeURIComponent(state));
    const parsed = JSON.parse(decoded) as State & StateProvider;

    if (parsed.original_state) {
      return decodeState(parsed.original_state);
    }

    return parsed;
  } catch (error) {
    console.error("Error decoding state:", error);
    return {} as State & StateProvider;
  }
}

/**
 * @name SLACK_OAUTH_CALLBACK
 * @title Slack OAuth Callback
 * @description Exchanges the authorization code for access tokens
 */
export default async function callback(
  { code, installId, clientId, clientSecret, redirectUri, state, queryParams }:
    Props,
  req: Request,
  ctx: AppContext,
): Promise<{ installId: string; name: string } | Response> {
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
  await ctx.configure({
    ...currentCtx,
    botUserId: tokenData.bot_user_id,
    botToken: tokenData.access_token, // Bot token for API calls
    userToken: tokenData.authed_user.access_token, // User token if needed
    teamId: tokenData.team.id,
    clientSecret: clientSecret,
    clientId: clientId,
    permission: {
      allCurrentAndFutureChannels: true,
    },
    account: tokenData.team.name,
    tokens: {
      access_token: tokenData.access_token,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
      tokenObtainedAt: currentTime,
    },
  });

  if (state) {
    const stateData = decodeState(state);
    if (queryParams?.savePermission || queryParams?.continue) {
      const { savePermission, continue: continueQueryParam } = queryParams ||
        {};

      if (continueQueryParam) {
        return {
          installId: stateData.installId,
          name: `Slack | ${tokenData.team.name}`,
        };
      }

      // Check if savePermission is a confirming value (boolean true or string "true")
      const isConfirmingSavePermission = savePermission === true ||
        (typeof savePermission === "string" && savePermission === "true");

      if (isConfirmingSavePermission) {
        return {
          installId: stateData.installId,
          name: `Slack | ${tokenData.team.name}`,
        };
      }

      const callbackUrl = new URL(req.url);
      callbackUrl.searchParams.set("savePermission", "true");

      const html = generateSelectionPage({
        workspace: {
          id: tokenData.team.id,
          name: tokenData.team.name,
        },
        user: {
          id: tokenData.authed_user.id,
          name: tokenData.authed_user.id,
        },
        callbackUrl: callbackUrl.toString(),
      });

      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    }
  }

  return { installId, name: `Slack | ${tokenData.team.name}` };
}
