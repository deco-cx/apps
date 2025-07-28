import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to remove the role
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID of the user to remove the role from
   */
  userId: string;

  /**
   * @title Role ID
   * @description ID of the role to remove from the user
   */
  roleId: string;

  /**
   * @title Reason
   * @description Reason for removing the role (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Remove Role from Member
 * @description Remove a role from a guild member (requires Manage Roles permission)
 */
export default async function removeRole(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { guildId, userId, roleId, reason } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!roleId) {
    throw new Error("Role ID is required");
  }

  // Remove role from member
  const response = await client["DELETE /guilds/:guild_id/members/:user_id/roles/:role_id"]({
    guild_id: guildId,
    user_id: userId,
    role_id: roleId,
    reason,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to remove role from member: ${response.statusText}`,
    );
  }
} 