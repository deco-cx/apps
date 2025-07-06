import { AppContext } from "../../mod.ts";
import { SpotifyTrack } from "../../client.ts";

interface Props {
  /**
   * @title Artist ID
   * @description Spotify artist ID
   */
  id: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;
}

/**
 * @title Get Artist Top Tracks
 * @description Get the most popular tracks from an artist
 */
export default async function getArtistTopTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyTrack[] }> {
  const { id, market } = props;

  const response = await ctx.client["GET /artists/:id/top-tracks"]({
    id,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting artist top tracks: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.tracks };
}
