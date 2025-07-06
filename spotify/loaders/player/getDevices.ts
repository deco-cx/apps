import { AppContext } from "../../mod.ts";
import { SpotifyDevice } from "../../client.ts";

/**
 * @title Get Devices
 * @description Get the user's available playback devices
 */
export default async function getDevices(
  _props: Record<PropertyKey, never>,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyDevice[] }> {
  const response = await ctx.client["GET /me/player/devices"]({});

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting devices: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.devices };
}
