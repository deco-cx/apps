import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifyPlaylistTrack } from "../../client.ts";

interface Props {
  /**
   * @title Playlist ID
   * @description Spotify playlist ID
   */
  playlist_id: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;

  /**
   * @title Fields
   * @description Specific fields to return (optional)
   */
  fields?: string;

  /**
   * @title Limit
   * @description Maximum number of tracks to return
   * @default 100
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first track to return
   * @default 0
   */
  offset?: number;

  /**
   * @title Additional Types
   * @description Additional types to include (track, episode)
   */
  additional_types?: string;
}

/**
 * @title Get Playlist Tracks
 * @description Get tracks from a specific playlist
 */
export default async function getPlaylistTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<SpotifyPlaylistTrack>> {
  const {
    playlist_id,
    market,
    fields,
    limit = 100,
    offset = 0,
    additional_types,
  } = props;

  const response = await ctx.client["GET /playlists/:playlist_id/tracks"]({
    playlist_id,
    market,
    fields,
    limit,
    offset,
    additional_types,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting playlist tracks: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
