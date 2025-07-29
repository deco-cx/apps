import { AppContext } from "../../mod.ts";
import { SpotifyPlaylist } from "../../client.ts";

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
   * @title Additional Types
   * @description Additional types to include (track, episode)
   */
  additional_types?: string;
}

/**
 * @title Get Playlist
 * @description Get detailed information about a specific playlist
 */
export default async function getPlaylist(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPlaylist> {
  const { playlist_id, market, fields, additional_types } = props;

  const response = await ctx.client["GET /playlists/:playlist_id"]({
    playlist_id,
    market,
    fields,
    additional_types,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting playlist: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
