import { AppContext } from "../../mod.ts";
import { SpotifyDevice } from "../../client.ts";

/**
 * @title Get Available Devices
 * @description Retrieves a list of available Spotify devices
 */
const loader = async (
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<{ devices: SpotifyDevice[] }> => {
  const response = await ctx.state.api["GET /me/player/devices"]();
  return await response.json();
};

export default loader;