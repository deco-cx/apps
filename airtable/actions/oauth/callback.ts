import type { AppContext } from "../../mod.ts";
import { OAUTH_URL_TOKEN } from "../../utils/constants.ts";
import { AirtableBase, PermissionParams } from "../../utils/types.ts";
import { fetchBasesAndTables } from "../../utils/ui-templates/airtable-client.ts";
import { generateSelectionPage } from "../../utils/ui-templates/page-generator.ts";

function decodePermission(permission: string): PermissionParams {
  const permissionData = JSON.parse(atob(permission));
  return permissionData as PermissionParams;
}

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
  queryParams: Record<string, string | boolean | undefined>;
}

function extractCodeVerifier(state: string): string | null {
  try {
    const stateData = JSON.parse(atob(state));
    const codeVerifier = stateData.code_verifier || null;
    return codeVerifier;
  } catch (_error) {
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
  try {
    const decoded = atob(decodeURIComponent(state));
    const parsed = JSON.parse(decoded) as State & StateProvider;

    if (parsed.original_state) {
      return decodeState(parsed.original_state);
    }

    return parsed;
  } catch (error) {
    console.error("Erro ao decodificar state:", error);
    return {} as State & StateProvider;
  }
}

function hasExistingPermissions(permission: unknown): boolean {
  if (!permission || typeof permission !== "object" || permission === null) {
    return false;
  }
  return Object.keys(permission as Record<string, unknown>).length > 0;
}

function createPermissionExistsError(
  installId: string,
  accountName: string | undefined,
) {
  return {
    installId,
    account: accountName,
    error:
      "Permissions already configured. Cannot overwrite existing permissions.",
  };
}

/**
 * @internal true
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
  req: Request,
  ctx: AppContext,
): Promise<Response | Record<string, unknown>> {
  const { savePermission, continue: continueQueryParam } = queryParams;

  if (!!savePermission || !!continueQueryParam) {
    const { permissions } = queryParams;

    const stateData = decodeState(state);
    const currentCtx = await ctx.getConfiguration();
    const account = await ctx.invoke.airtable.loaders.whoami({
      accessToken: currentCtx.tokens?.access_token || ctx.tokens?.access_token,
    })
      .then((user) => user.email)
      .catch((error) => {
        console.error("Error getting user:", error);
        return undefined;
      }) || undefined;

    let accountName = account;

    if (continueQueryParam) {
      if (hasExistingPermissions(currentCtx.permission)) {
        return createPermissionExistsError(stateData.installId, accountName);
      }

      await ctx.configure({
        ...currentCtx,
        permission: {
          allCurrentAndFutureTableBases: true,
        },
      });

      return {
        installId: stateData.installId,
        account: accountName,
      };
    }

    if (permissions && typeof permissions === "string") {
      if (hasExistingPermissions(currentCtx.permission)) {
        return createPermissionExistsError(stateData.installId, accountName);
      }
      const { bases, tables } = decodePermission(permissions);

      await ctx.configure({
        ...currentCtx,
        permission: {
          bases,
          tables,
        },
      });

      accountName = account ||
        bases.map((base: AirtableBase) => base.name).join(", ");

      return {
        installId: stateData.installId,
        account: accountName,
      };
    }
  }

  try {
    const uri = redirectUri || new URL("/oauth/callback", req.url).href;

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

    const newURL = req.url;
    const data = await fetchBasesAndTables(tokenData);

    const selectionHtml = generateSelectionPage({
      bases: data.bases,
      tables: data.tables,
      callbackUrl: newURL,
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
  } catch (error) {
    return {
      installId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
