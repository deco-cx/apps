import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Playlist ID
   * @description Spotify playlist ID
   */
  playlist_id: string;

  /**
   * @title Tracks
   * @description Tracks to remove from the playlist
   */
  tracks: {
    /**
     * @title Track URI
     * @description Spotify track URI (e.g: spotify:track:...)
     */
    uri: string;
    /**
     * @title Positions
     * @description Specific positions of the track in the playlist (optional)
     */
    positions?: number[];
  }[];

  /**
   * @title Snapshot ID
   * @description Playlist snapshot ID (optional, to avoid conflicts)
   */
  snapshot_id?: string;
}

/**
 * @title Remove Tracks from Playlist
 * @description Remove tracks from a playlist
 */
export default async function removeTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ snapshot_id: string }> {
  const { playlist_id, tracks, snapshot_id } = props;

  if (tracks.length === 0) {
    throw new Error("At least one track must be specified");
  }

  const response = await ctx.client["DELETE /playlists/:playlist_id/tracks"]({
    playlist_id,
  }, {
    body: {
      tracks,
      snapshot_id,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error removing tracks from playlist: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
