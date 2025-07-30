import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Application ID
   * @description ID da aplicação Discord para obter linked role connection
   */
  applicationId: string;
}

export interface RoleConnectionResponse {
  platform_name?: string;
  platform_username?: string;
  metadata?: Record<string, string | number>;
}

/**
 * @title Get Role Connection
 * @description Get the user's linked role connection data (OAuth - scope: role_connections.write)
 */
export default async function getRoleConnection(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<RoleConnectionResponse> {
  const { applicationId } = props;
  const { client } = ctx;

  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  // Get linked role connection
  const response = await client
    ["GET /users/@me/applications/:application_id/role-connection"]({
      application_id: applicationId,
    });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get role connection: ${response.statusText}`,
    );
  }

  const connection = await response.json();
  return connection;
}
