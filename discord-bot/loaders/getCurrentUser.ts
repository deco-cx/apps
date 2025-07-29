import type { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

/**
 * @title Get Current User
 * @description Get information about the bot's own user account using Bot Token
 */
export default async function getCurrentUser(
  _props: {},
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser> {
  const { client } = ctx;

  // Get current user (bot)
  const response = await client["GET /users/@me"]({});

  if (!response.ok) {
    throw new Error(`Failed to get current user: ${response.statusText}`);
  }

  const user = await response.json();
  return user;
}