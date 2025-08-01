import type { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  /**
   * @title User ID
   * @description ID do usuário para obter informações
   */
  userId: string;
}

/**
 * @title Get User
 * @description Get information about a specific Discord user using Bot Token
 */
export default async function getUser(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser> {
  const { userId } = props;
  const { client } = ctx;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Get user
  const response = await client["GET /users/:user_id"]({
    user_id: userId,
  });

  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`);
  }

  const user = await response.json();
  return user;
}
