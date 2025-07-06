import { AppContext } from "../../mod.ts";
import { AddTracksRequest } from "../../client.ts";

interface Props {
  /**
   * @title Playlist ID
   * @description The Spotify playlist ID to add tracks to
   */
  playlistId: string;

  /**
   * @title Track URIs
   * @description Comma-separated list of Spotify track URIs to add
   */
  trackUris: string;

  /**
   * @title Position
   * @description Position to insert tracks at (optional)
   */
  position?: number;
}

/**
 * @title Add Tracks to Playlist
 * @description Adds one or more tracks to a user's playlist
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ snapshot_id: string }> => {
  const { playlistId, trackUris, position } = props;

  // Split the comma-separated URIs and clean them
  const uris = trackUris.split(",").map((uri) => uri.trim());

  // Create properly typed request body
  const body: AddTracksRequest = { uris };
  if (position !== undefined) {
    body.position = position;
  }

  const response = await ctx.state.api["POST /playlists/:playlist_id/tracks"]({
    playlist_id: playlistId,
  }, { body });

  return await response.json();
};

export default action;