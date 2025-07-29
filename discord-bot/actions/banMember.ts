import type { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord
   */
  guildId: string;

  /**
   * @title User ID
   * @description ID do usuário a ser banido
   */
  userId: string;

  /**
   * @title Delete Message Days
   * @description Número de dias de mensagens a deletar (0-7)
   * @default 0
   */
  deleteMessageDays?: number;

  /**
   * @title Reason
   * @description Motivo do banimento
   */
  reason?: string;
}

/**
 * @title Ban Member
 * @description Ban a member from a Discord server using Bot Token
 */
export default async function banMember(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
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

  // Ban member from guild
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/bans/${userId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bot ${ctx.botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      delete_message_days: validDeleteDays,
      reason,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to ban member: ${response.statusText}`);
  }

  return { success: true };
}