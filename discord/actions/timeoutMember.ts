import type { AppContext } from "../mod.ts";
import { DiscordGuildMember } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description Discord guild ID where to apply timeout
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID of the user to receive timeout
   */
  userId: string;

  /**
   * @title Timeout Minutes
   * @description Timeout duration in minutes (1-40320, i.e., up to 28 days). Use 0 to remove timeout.
   */
  timeoutMinutes: number;

  /**
   * @title Reason
   * @description Reason for the timeout (will be shown in audit log)
   */
  reason?: string;
}

/**
 * @title Timeout Member
 * @description Apply timeout to a guild member or remove existing timeout (requires Moderate Members permission)
 */
export default async function timeoutMember(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuildMember> {
  const { guildId, userId, timeoutMinutes, reason } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  if (timeoutMinutes < 0 || timeoutMinutes > 40320) {
    throw new Error("Timeout duration must be between 0 and 40320 minutes (28 days)");
  }

  // Calculate timeout end timestamp
  let timeoutUntil: string | null = null;
  
  if (timeoutMinutes > 0) {
    const timeoutEnd = new Date();
    timeoutEnd.setMinutes(timeoutEnd.getMinutes() + timeoutMinutes);
    timeoutUntil = timeoutEnd.toISOString();
  }

  // Build request body
  const body: any = {
    communication_disabled_until: timeoutUntil,
  };

  // Apply timeout
  const response = await client["PATCH /guilds/:guild_id/members/:user_id"]({
    guild_id: guildId,
    user_id: userId,
  }, body);

  if (!response.ok) {
    const actionText = timeoutMinutes > 0 ? "apply timeout to" : "remove timeout from";
    ctx.errorHandler.toHttpError(
      response,
      `Failed to ${actionText} member: ${response.statusText}`,
    );
  }

  const member = await response.json();
  return member;
} 