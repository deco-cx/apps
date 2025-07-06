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
   * @description Additional types to include (track, episode)
   */
  additional_types?: string;
}

/**
 * @title Get Playback State
 * @description Get the user's current playback state
 */
export default async function getPlaybackState(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPlaybackState | null> {
  const { market, additional_types } = props;

  const response = await ctx.client["GET /me/player"]({
    market,
    additional_types,
  });

  if (response.status === 204) {
    // No content - no active playback
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting playback state: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
