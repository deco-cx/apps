import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to add the role
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID of the user to add the role to
   */
  userId: string;

  /**
   * @title Role ID
   * @description ID of the role to add to the user
   */
  roleId: string;

  /**
   * @title Reason
   * @description Reason for adding the role (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Add Role to Member
 * @description Add a role to a guild member (requires Manage Roles permission)
 */
export default async function addRole(
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

  // Build request body
  const body: any = {};
  
  if (reason) {
    body.reason = reason;
  }

  // Add role to member
  const response = await client["PUT /guilds/:guild_id/members/:user_id/roles/:role_id"]({
    guild_id: guildId,
    user_id: userId,
    role_id: roleId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to add role to member: ${response.statusText}`,
    );
  }
} 