import type { AppContext } from "../mod.ts";
import { DiscordGuildMember } from "../utils/types.ts";

export interface Props {
  /**
   * @title Guild ID
   * @description ID do servidor Discord para obter informações de membro
   */
  guildId: string;
}

/**
 * @title Get User Guild Member
 * @description Get the user's member information in a specific guild (OAuth)
 */
export default async function getUserGuildMember(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordGuildMember> {
  const { guildId } = props;
  const { client } = ctx;

  if (!guildId) {
    throw new Error("Guild ID is required");
  }

  // Get user's member info in specific guild
  const response = await client["GET /users/@me/guilds/:guild_id/member"]({
    guild_id: guildId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user guild member: ${response.statusText}`,
    );
  }

  const member = await response.json();
  return member;
}
