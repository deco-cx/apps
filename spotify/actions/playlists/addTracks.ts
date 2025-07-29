import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Playlist ID
   * @description Playlist ID
   */
  playlist_id: string;

  /**
   * @title Track URIs
   * @description List of track URIs to add (comma-separated)
   */
  uris: string;

  /**
   * @title Position
   * @description Position where to insert tracks (optional)
   */
  position?: number;
}

/**
 * @title Add Tracks to Playlist
 * @description Add tracks to a playlist
 */
export default async function addTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ snapshot_id: string }> {
  const { playlist_id, uris, position } = props;

  // Convert comma-separated string to array
  const trackUris = uris.split(",").map((uri) => uri.trim());

  const response = await ctx.client["POST /playlists/:playlist_id/tracks"](
    { playlist_id },
    {
      body: {
        uris: trackUris,
        ...(position !== undefined && { position }),
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error adding tracks to playlist: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
