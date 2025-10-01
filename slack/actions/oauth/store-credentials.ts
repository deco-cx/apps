import { storeCustomBotSession } from "../../utils/state-helpers.ts";

export interface Props {
  /**
   * @title Client ID
   * @description The OAuth client ID from your Slack app
   */
  clientId: string;

  /**
   * @title Client Secret
   * @description The OAuth client secret from your Slack app
   * @format password
   */
  clientSecret: string;

  /**
   * @title Bot Name
   * @description Custom bot identifier (optional)
   */
  botName?: string;

  /**
   * @title Return URL
   * @description URL to redirect to after storing credentials (for form fallback)
   */
  returnUrl?: string;
}

/**
 * @name STORE_CUSTOM_CREDENTIALS
 * @title Store Custom Bot Credentials
 * @description Securely stores custom bot credentials and returns a session token for OAuth flow
 */
export default function storeCustomCredentials(
  { clientId, clientSecret, botName, returnUrl }: Props,
  req: Request,
): Response | { sessionToken: string } {
  if (!clientId || !clientSecret) {
    throw new Error("Client ID and Client Secret are required");
  }

  const sessionToken = storeCustomBotSession(clientId, clientSecret, botName);

  // Check if this is a form submission (fallback method)
  const contentType = req.headers.get("content-type") || "";
  const isFormSubmission = contentType.includes(
    "application/x-www-form-urlencoded",
  );

  if (isFormSubmission && returnUrl) {
    // Form fallback: redirect with session token in URL
    const url = new URL(returnUrl);
    url.searchParams.set("useCustomBot", "true");
    url.searchParams.set("sessionToken", sessionToken);

    return Response.redirect(url.toString());
  }

  // JSON response for fetch requests
  return { sessionToken };
}
