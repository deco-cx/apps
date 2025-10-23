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

  const validDeleteDays = Math.min(Math.max(deleteMessageDays, 0), 7);

  const response = await client["PUT /guilds/:guild_id/bans/:user_id"]({
    guild_id: guildId,
    user_id: userId,
  }, {
    body: {
      delete_message_days: validDeleteDays,
      reason,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to ban member: ${response.statusText}`);
  }

  return { success: true };
}
