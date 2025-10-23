import type { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  /**
   * @title User ID
   * @description Discord user ID to get information from
   */
  userId: string;
}

/**
 * @title Get User Information
 * @description Get detailed information about a specific Discord user
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

  // Get user information
  const response = await client["GET /users/:user_id"]({
    user_id: userId,
  });

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user information: ${response.statusText}`,
    );
  }

  const user = await response.json();
  return user;
}
