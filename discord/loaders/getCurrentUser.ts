import { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  // No props needed to get current user information
}

/**
 * @title Get Bot Information
 * @description Get information about the authenticated bot/current user
 */
export default async function getCurrentUser(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser> {
  const { client } = ctx;

  // Get current user information (bot)
  const response = await client["GET /users/@me"]({});

  if (!response.ok) {
    throw ctx.errorHandler.toHttpError(
      response,
      `Failed to get bot information: ${response.statusText}`,
    );
  }

  const user = await response.json();
  return user;
} 