import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to ban the member
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID of the user to be banned
   */
  userId: string;

  /**
   * @title Delete Message Days
   * @description Number of days of user messages to delete (0-7, default: 0)
   */
  deleteMessageDays?: number;

  /**
   * @title Reason
   * @description Reason for the ban (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Ban Member
 * @description Ban a member from the Discord guild (requires Ban Members permission)
 */
export default async function banMember(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> {
  const { guildId, userId, deleteMessageDays = 0, reason } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Validate delete message days
  const validDeleteDays = Math.min(Math.max(deleteMessageDays, 0), 7);

  // Build request body
  const body: any = {};
  
  if (validDeleteDays > 0) {
    body.delete_message_days = validDeleteDays;
  }
  
  if (reason) {
    body.reason = reason;
  }

  // Ban member
  const response = await client["PUT /guilds/:guild_id/bans/:user_id"]({
    guild_id: guildId,
    user_id: userId,
  }, body);

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to ban member: ${response.statusText}`,
    );
  }
} 