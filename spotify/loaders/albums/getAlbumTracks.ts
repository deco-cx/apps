import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifySimplifiedTrack } from "../../client.ts";

interface Props {
  /**
   * @title Album ID
   * @description Spotify album ID
   */
  id: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;

  /**
   * @title Limit
   * @description Maximum number of tracks to return
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first track to return
   * @default 0
   */
  offset?: number;
}

/**
 * @title Get Album Tracks
 * @description Get tracks from a specific album
 */
export default async function getAlbumTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<SpotifySimplifiedTrack>> {
  const { id, market, limit = 20, offset = 0 } = props;

  const response = await ctx.client["GET /albums/:id/tracks"]({
    id,
    market,
    limit,
    offset,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting album tracks: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
