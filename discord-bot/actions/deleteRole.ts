import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor onde está o role
   */
  guildId: string;

  /**
   * @title Role ID
   * @description ID do role a ser deletado
   */
  roleId: string;

  /**
   * @title Reason
   * @description Motivo para deletar o role (audit log)
   */
  reason?: string;
}

/**
 * @title Delete Role
 * @description Delete a role from a Discord server using Bot Token
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
    throw new Error(`Failed to delete role: ${response.statusText}`);
  }
}
