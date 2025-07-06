import { AppContext } from "../../mod.ts";
import { SpotifyUser } from "../../client.ts";

/**
 * @title Get Current User Profile
 * @description Retrieves the current user's Spotify profile information
 */
const loader = async (
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyUser> => {
  const response = await ctx.state.api["GET /me"]();
  return await response.json();
};

export default loader;