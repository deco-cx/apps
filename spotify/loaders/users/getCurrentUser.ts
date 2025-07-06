import { AppContext } from "../../mod.ts";
import { SpotifyUser } from "../../client.ts";

/**
 * @title Get Current User
 * @description Get the complete profile of the current authenticated user
 */
export default async function getCurrentUser(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyUser> {
  const response = await ctx.client["GET /me"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting user: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
