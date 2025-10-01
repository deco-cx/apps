import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constants.ts";
import { generateBotSelectionPage } from "../../utils/ui-templates/page-generator.ts";
import {
  decodeState,
  retrieveCustomBotSession,
} from "../../utils/state-helpers.ts";

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

export default function start(props: Props, req: Request) {
  const url = new URL(req.url);
  const useDecoChatBot = url.searchParams.get("useDecoChatBot");
  const useCustomBot = url.searchParams.get("useCustomBot");

  // If no specific bot type is selected, show the selection page
  if (!useDecoChatBot && !useCustomBot) {
    const callbackUrl = req.url;
    const selectionHtml = generateBotSelectionPage({
      callbackUrl,
    });

    return new Response(selectionHtml, {
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

  if (useCustomBot) {
    // SECURITY: Only accept session token, never raw credentials
    const sessionToken = url.searchParams.get("sessionToken");

    if (!sessionToken) {
      throw new Error("Custom bot requires a valid session token");
    }

    // Retrieve credentials securely using the session token
    const credentials = retrieveCustomBotSession(sessionToken);

    if (!credentials) {
      throw new Error("Invalid or expired session token");
    }

    // Store ONLY the session token in state, never the actual secret
    const stateData = decodeState(props.state);
    stateData.sessionToken = sessionToken;
    stateData.customBotName = credentials.botName || "Custom Bot";
    stateData.isCustomBot = true;

    // SECURITY: Properly URL-encode the base64 state
    const enhancedState = encodeURIComponent(btoa(JSON.stringify(stateData)));

    const authParams = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: redirectUri?.replace("http://", "https://"),
      response_type: "code",
      scope: SCOPES.join(","),
      state: enhancedState,
    });

    const authorizationUrl = `${OAUTH_URL_AUTH}?${authParams.toString()}`;
    return Response.redirect(authorizationUrl);
  } else {
    // Use deco.chat bot - default behavior
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
}
