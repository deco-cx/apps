import { AppContext } from "../mod.ts";
import { DiscordUser } from "../utils/types.ts";

export interface Props {
  // No props needed to get current user information
}

/**
 * @title Get Current User
 * @description Get information about the authenticated user (OAuth - scopes: identify + email)
 */
export default async function getCurrentUser(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<DiscordUser> {
  const { client } = ctx;

  // Get current user information
  const response = await client["GET /users/@me"]({});

  if (!response.ok) {
    ctx.errorHandler.toHttpError(
      response,
      `Failed to get user information: ${response.statusText}`,
    );
  }

  const user = await response.json();
  return user;
}