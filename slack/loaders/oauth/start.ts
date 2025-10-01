import { OAUTH_URL_AUTH, SCOPES } from "../../utils/constants.ts";
import { generateBotSelectionPage } from "../../utils/ui-templates/page-generator.ts";
import { decodeState } from "../../utils/state-helpers.ts";

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
    const customClientId = url.searchParams.get("customClientId");
    const customClientSecret = url.searchParams.get("customClientSecret");
    const customBotName = url.searchParams.get("customBotName");

    if (!customClientId || !customClientSecret) {
      throw new Error("Custom bot requires clientId and clientSecret");
    }

    // Store custom credentials in state for callback
    const stateData = decodeState(props.state);
    stateData.customClientSecret = customClientSecret;
    stateData.customBotName = customBotName || "Custom Bot";
    stateData.isCustomBot = true;

    const enhancedState = btoa(JSON.stringify(stateData));

    const authParams = new URLSearchParams({
      client_id: customClientId,
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
