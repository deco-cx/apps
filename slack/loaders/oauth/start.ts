import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constants.ts";
import {
  decodeState,
  retrieveCustomBotSession,
  storeCustomBotSession,
} from "../../utils/state-helpers.ts";
import { generateBotSelectionPage } from "../../utils/ui-templates/page-generator.ts";
import type { AppContext } from "../../mod.ts";

export interface Props {
  clientId: string;
  redirectUri: URL | string;
  state: string;
  /**
   * @title Bot Name
   * @description Name identifier for custom bot (used for identification)
   */
  botName?: string;
}

/**
 * @title Slack OAuth Start
 * @description Initiates the Slack OAuth flow with support for custom and default bots
 */
export default async function start(
  props: Props,
  req: Request,
  _ctx: AppContext,
) {
  const url = new URL(req.url);
  const method = req.method;

  // Handle CORS preflight requests
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Handle POST requests for storing custom bot credentials
  if (method === "POST") {
    try {
      const body = await req.json();

      // Enhanced validation
      if (body.action === "storeCredentials") {
        const { clientId, clientSecret, botName } = body;

        // Validate required fields
        if (!clientId || !clientSecret) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Client ID and Client Secret are required",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        // Validate field formats and lengths
        if (
          typeof clientId !== "string" || clientId.length < 8 ||
          clientId.length > 100
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid Client ID format",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        if (
          typeof clientSecret !== "string" || clientSecret.length < 8 ||
          clientSecret.length > 100
        ) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Invalid Client Secret format",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        if (botName && (typeof botName !== "string" || botName.length > 50)) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Bot name must be less than 50 characters",
            }),
            {
              status: 400,
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
            },
          );
        }

        // Store credentials securely and return session token
        const sessionToken = storeCustomBotSession(
          clientId.trim(),
          clientSecret.trim(),
          botName?.trim() || undefined,
        );

        return new Response(
          JSON.stringify({
            success: true,
            sessionToken,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "POST",
              "Access-Control-Allow-Headers": "Content-Type",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid request action",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } catch (error) {
      console.error("POST request processing error:", error);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Request processing failed",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  }

  // Check for bot selection parameters
  const useDecoChatBot = url.searchParams.get("useDecoChatBot");
  const useCustomBot = url.searchParams.get("useCustomBot");
  const sessionToken = url.searchParams.get("sessionToken");

  // If no specific bot type is selected, show the selection page
  if (!useDecoChatBot && !useCustomBot) {
    return new Response(generateBotSelectionPage(req.url), {
      headers: {
        "Content-Type": "text/html",
        "Content-Security-Policy":
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
      },
    });
  }

  const redirectUri = props.redirectUri instanceof URL
    ? props.redirectUri.href
    : props.redirectUri;

  // Handle deco.chat bot (default flow)
  if (useDecoChatBot) {
    const authParams = new URLSearchParams({
      client_id: props.clientId,
      redirect_uri: redirectUri?.replace("http://", "https://"),
      response_type: "code",
      scope: SCOPES.join(","),
      state: props.state,
    });

    const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;
    return Response.redirect(authorizationUrl);
  }

  // Handle custom bot
  if (useCustomBot) {
    // Check if session token is provided
    if (!sessionToken) {
      return new Response(generateBotSelectionPage(req.url), {
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
        },
      });
    }

    // Retrieve credentials using session token
    const credentials = retrieveCustomBotSession(sessionToken);

    if (!credentials) {
      // Return JSON error instead of HTML
      return new Response(
        JSON.stringify({
          success: false,
          error: "Session expired or invalid. Please restart the integration.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Prepare enhanced state with session token reference
    const stateData = decodeState(props.state);
    stateData.sessionToken = sessionToken;
    stateData.customBotName = credentials.botName || "Custom Bot";
    stateData.isCustomBot = true;

    const enhancedState = btoa(JSON.stringify(stateData));

    const authParams = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: redirectUri?.replace("http://", "https://"),
      response_type: "code",
      scope: SCOPES.join(","),
      state: enhancedState,
    });

    const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;
    return Response.redirect(authorizationUrl);
  }

  // If we reach here, invalid configuration
  return new Response(
    JSON.stringify({
      success: false,
      error: "Invalid OAuth configuration. Please restart the integration.",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
