import { AppContext } from "../../mod.ts";
import { SpotifyUser } from "../../client.ts";

/**
 * @title Get Current User
 * @description Retrieves detailed information about the current user
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