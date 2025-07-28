import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where the role is located
   */
  guildId: string;

  /**
   * @title Role ID
   * @description ID of the role to delete
   */
  roleId: string;

  /**
   * @title Reason
   * @description Reason for deleting the role (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Delete Role
 * @description Delete a role from a Discord guild permanently (requires Manage Roles permission)
 */
export default async function deleteRole(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { guildId, roleId, reason } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!roleId) {
    throw new Error("Role ID is required");
  }

  // Delete role
  const response = await client["DELETE /guilds/:guild_id/roles/:role_id"]({
    guild_id: guildId,
    role_id: roleId,
    reason,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to delete role: ${response.statusText}`,
    );
  }
} 