import type { AppContext } from "../../mod.ts";
import { generateSelectionPage } from "../../utils/ui-templates/page-generator.ts";

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope: string;
  ok: boolean;
  app_id: string;
  authed_user: {
    id: string;
    scope?: string;
    access_token?: string;
    token_type?: string;
  };
  team: {
    id: string;
    name: string;
  };
  enterprise?: Record<string, unknown>;
  is_enterprise_install?: boolean;
}

export interface Props {
  /**
   * @title Authorization Code
   * @description The authorization code received from Slack
   */
  code: string;

  /**
   * @title State
   * @description The state parameter returned from authorization
   */
  state: string;

  /**
   * @title Install ID
   * @description Unique identifier for this installation
   */
  installId: string;

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

    if (continueQueryParam) {
      if (hasExistingPermissions(currentCtx.permission)) {
        return createPermissionExistsError(
          stateData.installId,
          currentCtx.account || "Unknown",
        );
      }

      await ctx.configure({
        ...currentCtx,
        permission: {
          allCurrentAndFutureChannels: true,
        },
      });

      return {
        installId: stateData.installId,
        account: currentCtx.account || "Unknown",
      };
    }

    if (permissions && typeof permissions === "string") {
      if (hasExistingPermissions(currentCtx.permission)) {
        return createPermissionExistsError(
          stateData.installId,
          currentCtx.account || "Unknown",
        );
      }

      // Validate and parse permissions data with proper error handling
      let permissionsData: {
        workspace: { name: string; id?: string; [key: string]: unknown };
        channels?: Array<{ id: string; name: string; [key: string]: unknown }>;
        [key: string]: unknown;
      };
      try {
        // Decode base64 and validate it's valid UTF-8
        const decodedPermissions = atob(permissions);

        // Validate that the decoded string is valid UTF-8 by attempting to encode it back
        if (btoa(decodedPermissions) !== permissions) {
          throw new Error("Invalid base64 encoding or non-UTF-8 content");
        }

        // Parse JSON with validation
        permissionsData = JSON.parse(decodedPermissions);

        // Validate object shape
        if (typeof permissionsData !== "object" || permissionsData === null) {
          throw new Error("Permissions data must be a valid object");
        }

        // Validate workspace object
        if (
          !permissionsData.workspace ||
          typeof permissionsData.workspace !== "object"
        ) {
          throw new Error("Permissions data must contain a workspace object");
        }

        if (
          !permissionsData.workspace.name ||
          typeof permissionsData.workspace.name !== "string"
        ) {
          throw new Error("Workspace must have a valid name string");
        }

        if (
          !permissionsData.workspace.id ||
          typeof permissionsData.workspace.id !== "string"
        ) {
          throw new Error("Workspace must have a valid id string");
        }

        // Validate channels array (optional)
        if (permissionsData.channels !== undefined) {
          if (!Array.isArray(permissionsData.channels)) {
            throw new Error("Channels must be an array");
          }

          // Validate each channel object
          for (const channel of permissionsData.channels) {
            if (typeof channel !== "object" || channel === null) {
              throw new Error("Each channel must be a valid object");
            }
            if (!channel.id || typeof channel.id !== "string") {
              throw new Error("Each channel must have a valid id string");
            }
            if (!channel.name || typeof channel.name !== "string") {
              throw new Error("Each channel must have a valid name string");
            }
          }
        }
      } catch (error) {
        console.error("Error parsing permissions data:", error);
        return new Response(
          JSON.stringify({
            error: "Invalid permissions data",
            message: error instanceof Error
              ? error.message
              : "Unknown parsing error",
            installId: stateData.installId,
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // At this point, we know permissionsData is valid and has required fields
      const { workspace, channels } = permissionsData as {
        workspace: { id: string; name: string; [key: string]: unknown };
        channels?: Array<{ id: string; name: string; [key: string]: unknown }>;
      };

      await ctx.configure({
        ...currentCtx,
        permission: {
          workspace,
          channels,
        },
        account: workspace.name,
      });

      return {
        installId: stateData.installId,
        account: workspace.name,
      };
    }
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json() as OAuthTokenResponse;

    if (!tokenData.ok) {
      throw new Error(`Slack OAuth error: ${JSON.stringify(tokenData)}`);
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // Get current configuration and update with new tokens
    const currentCtx = await ctx.getConfiguration();
    await ctx.configure({
      ...currentCtx,
      botToken: tokenData.access_token,
      userToken: tokenData.authed_user.access_token,
      teamId: tokenData.team.id,
      clientSecret: clientSecret,
      clientId: clientId,
      tokens: {
        access_token: tokenData.access_token,
        scope: tokenData.scope,
        token_type: tokenData.token_type,
        tokenObtainedAt: currentTime,
      },
    });

    // Fetch basic workspace and user info with error handling
    let teamResponse: Response;
    let userResponse: Response;

    try {
      [teamResponse, userResponse] = await Promise.all([
        fetch("https://slack.com/api/team.info", {
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("https://slack.com/api/users.info", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            user: tokenData.authed_user.id,
          }),
        }),
      ]);
    } catch (fetchError) {
      console.error("Network error during Slack API calls:", fetchError);
      throw new Error(
        `Failed to connect to Slack API: ${
          fetchError instanceof Error
            ? fetchError.message
            : "Unknown network error"
        }`,
      );
    }

    // Validate HTTP responses
    if (!teamResponse.ok) {
      throw new Error(
        `Slack team.info API returned ${teamResponse.status} ${teamResponse.statusText} (${teamResponse.url})`,
      );
    }

    if (!userResponse.ok) {
      throw new Error(
        `Slack users.info API returned ${userResponse.status} ${userResponse.statusText} (${userResponse.url})`,
      );
    }

    let teamData: {
      ok: boolean;
      error?: string;
      team?: { id: string; name: string; domain?: string };
    };
    let userData: {
      ok: boolean;
      error?: string;
      user?: { id: string; name: string; real_name?: string };
    };

    try {
      [teamData, userData] = await Promise.all([
        teamResponse.json(),
        userResponse.json(),
      ]);
    } catch (parseError) {
      console.error("Error parsing Slack API responses:", parseError);
      throw new Error(
        `Failed to parse Slack API response: ${
          parseError instanceof Error
            ? parseError.message
            : "Unknown parse error"
        }`,
      );
    }

    if (!teamData.ok || !userData.ok) {
      throw new Error(
        `Failed to fetch Slack data: team=${
          teamData.error || "unknown error"
        }, user=${userData.error || "unknown error"}`,
      );
    }

    // Validate that required data exists
    if (!teamData.team) {
      throw new Error("Slack team.info response missing team data");
    }

    if (!userData.user) {
      throw new Error("Slack users.info response missing user data");
    }

    // Fetch channels (limit to first 50 for display)
    const channelsResponse = await fetch(
      "https://slack.com/api/conversations.list",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          limit: "50",
          types: "public_channel,private_channel",
        }),
      },
    );

    const channelsData = await channelsResponse.json();
    const channels = channelsData.ok ? channelsData.channels || [] : [];

    const workspace = {
      id: teamData.team.id,
      name: teamData.team.name,
      domain: teamData.team.domain,
    };

    const user = {
      id: userData.user.id,
      name: userData.user.name,
      real_name: userData.user.real_name,
    };

    // Generate selection page
    const callbackUrl = new URL(req.url);
    callbackUrl.searchParams.set("savePermission", "true");

    const html = generateSelectionPage({
      workspace,
      channels,
      user,
      callbackUrl: callbackUrl.toString(),
    });

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    return {
      installId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
