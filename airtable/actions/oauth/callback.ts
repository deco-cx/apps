import type { AppContext } from "../../mod.ts";
import { OAUTH_URL_TOKEN } from "../../utils/constants.ts";
import { fetchBasesAndTables } from "../../utils/ui-templates/airtable-client.ts";
import {
  AirtableBase,
  AirtableTable,
  generateSelectionPage,
} from "../../utils/ui-templates/page-generator.ts";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
}

export interface Props {
  /**
   * @title Authorization Code
   * @description The authorization code received from Airtable
   */
  code: string;

  /**
   * @title State
   * @description The state parameter returned from authorization (contains code_verifier)
   */
  state: string;

  /**
   * @title Install ID
   * @description Unique identifier for this installation
   */
  installId: string;

  /**
   * @title Client ID
   * @description The OAuth client ID from your Airtable app
   */
  clientId: string;

  /**
   * @title Client Secret
   * @description The OAuth client secret from your Airtable app
   * @format password
   */
  clientSecret: string;

  /**
   * @title Redirect URI
   * @description The same redirect URI used in the authorization request
   */
  redirectUri: string;

  /**
   * @title Query Params
   * @description The query parameters from the request
   */
  queryParams: Record<string, string>;
}

// Function to extract code_verifier from state
function extractCodeVerifier(state: string): string | null {
  try {
    console.log("Attempting to parse state:", state);
    const stateData = JSON.parse(atob(state));
    console.log("Parsed state data:", stateData);
    const codeVerifier = stateData.code_verifier || null;
    console.log(
      "Extracted code_verifier:",
      codeVerifier ? "found" : "not found",
    );
    return codeVerifier;
  } catch (error) {
    console.error("Failed to parse state parameter:", error);
    return null;
  }
}

interface StateProvider {
  original_state?: string;
  code_verifier?: string;
}
interface State {
  appName: string;
  installId: string;
  invokeApp: string;
  returnUrl?: string | null;
  redirectUri?: string | null;
}

function decodeState(state: string): State & StateProvider {
  const decoded = atob(decodeURIComponent(state));
  const parsed = JSON.parse(decoded) as State & StateProvider;

  if (parsed.original_state) {
    return decodeState(parsed.original_state);
  }

  return parsed;
}

/**
 * @title OAuth Callback
 * @description Exchanges the authorization code for access tokens with PKCE support
 */
export default async function callback(
  {
    code,
    state,
    installId,
    clientId,
    clientSecret,
    redirectUri,
    queryParams,
  }: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Response | Record<string, unknown>> {
  const { isSaveBase, skip } = queryParams;

  if (isSaveBase) {
    const { selectedBases, selectedTables } = queryParams;
    const teste = decodeState(state);

    if (skip === "true") {
      return {
        installId: teste.installId,
      };
    }

    const basesArray = selectedBases
      ? selectedBases.split(",").map((base) => {
        const [id, name] = base.split(":");
        return { id, name };
      })
      : [];

    const tablesArray = selectedTables
      ? selectedTables.split(",").map((table) => {
        const [id, name] = table.split(":");
        return { id, name };
      })
      : [];

    const currentCtx = await ctx.getConfiguration();
    await ctx.configure({
      ...currentCtx,
      permission: {
        bases: basesArray,
        tables: tablesArray,
      },
    });

    return {
      installId: teste.installId,
      appName: teste.appName + " - " + "Bases: " + basesArray.map((b) =>
        b.name
      ).join(", ") + " - " + "Tables: " + tablesArray.map((t) =>
        t.name
      ).join(", "),
    };
  }

  try {
    const uri = redirectUri || new URL("/oauth/callback", _req.url).href;

    const codeVerifier = extractCodeVerifier(state);
    if (!codeVerifier) {
      throw new Error(
        "code_verifier not found in state parameter. PKCE is required for Airtable OAuth.",
      );
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);

    const tokenRequestBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: uri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(OAUTH_URL_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "Authorization": `Basic ${credentials}`,
      },
      body: tokenRequestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    const tokenData = await response.json() as OAuthTokenResponse;
    const currentTime = Math.floor(Date.now() / 1000);

    const currentCtx = await ctx.getConfiguration();
    await ctx.configure({
      ...currentCtx,
      tokens: {
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        tokenObtainedAt: currentTime,
      },
      clientSecret: clientSecret,
      clientId: clientId,
    });

    const newURL = _req.url;
    let bases: AirtableBase[] = [];
    let tables: AirtableTable[] = [];

    const data = await fetchBasesAndTables(tokenData);
    bases = data.bases;
    tables = data.tables;

    const selectionHtml = generateSelectionPage({
      bases,
      tables,
      callbackUrl: newURL,
    });

    return new Response(selectionHtml, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return {
      installId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
