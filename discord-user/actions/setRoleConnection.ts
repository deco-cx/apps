import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Application ID
   * @description ID da aplicação Discord para linked roles
   */
  applicationId: string;

  /**
   * @title Platform Name
   * @description Nome da plataforma externa (ex: "Steam", "GitHub")
   */
  platformName?: string;

  /**
   * @title Platform Username
   * @description Nome de usuário na plataforma externa
   */
  platformUsername?: string;

  /**
   * @title Metadata
   * @description Metadados customizados para linked roles
   */
  metadata?: Record<string, string | number>;
}

export interface RoleConnectionResponse {
  platform_name?: string;
  platform_username?: string;
  metadata?: Record<string, string | number>;
}

/**
 * @title Set Role Connection
 * @description Set the user's linked role connection data (OAuth - scope: role_connections.write)
 */
export default async function setRoleConnection(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RoleConnectionResponse> {
  const { applicationId, platformName, platformUsername, metadata } = props;
  const { tokens } = ctx;

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  if (!tokens?.access_token) {
    throw new Error("Access token is required");
  }

  // Set linked role connection
  const response = await fetch(
    `https://discord.com/api/v10/users/@me/applications/${applicationId}/role-connection`,
    {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        platform_name: platformName,
        platform_username: platformUsername,
        metadata,
      }),
    },
  );

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to set role connection: ${response.statusText}`,
    );
  }

  const connection = await response.json();
  return connection;
}
