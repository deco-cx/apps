import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to kick the member
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID of the user to be kicked
   */
  userId: string;

  /**
   * @title Reason
   * @description Reason for the kick (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Kick Member
 * @description Kick a member from the Discord guild (requires Kick Members permission)
 */
export default async function kickMember(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { guildId, userId, reason } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Kick member
  const response = await client["DELETE /guilds/:guild_id/members/:user_id"]({
    guild_id: guildId,
    user_id: userId,
    reason,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to kick member: ${response.statusText}`,
    );
  }
} 