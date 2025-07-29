import { AppContext } from "../../mod.ts";
import { SpotifyPlaybackState } from "../../client.ts";

interface Props {
  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;

  /**
   * @title Additional Types
   * @description Additional content types (episode, track)
   */
  additional_types?: string;
}

/**
 * @title Get Current Track
 * @description Get information about the currently playing track
 */
export default async function getCurrentTrack(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPlaybackState | null> {
  const { market, additional_types } = props;

  const response = await ctx.client["GET /me/player/currently-playing"]({
    market,
    additional_types,
  });

  if (!response.ok) {
    if (response.status === 204) {
      // No track playing
      return null;
    }
    const errorText = await response.text();
    throw new Error(
      `Error getting current track: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
