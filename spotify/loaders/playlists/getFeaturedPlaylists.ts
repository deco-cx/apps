import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifyPlaylist } from "../../client.ts";

interface Props {
  /**
   * @title Country
   * @description Country code to filter playlists (ISO 3166-1 alpha-2)
   */
  country?: string;

  /**
   * @title Limit
   * @description Maximum number of playlists to return (1-50)
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first playlist to return
   * @default 0
   */
  offset?: number;

  /**
   * @title Timestamp
   * @description ISO 8601 timestamp to filter by date
   */
  timestamp?: string;
}

/**
 * @title Get Featured Playlists
 * @description Get featured playlists from Spotify
 */
export default async function getFeaturedPlaylists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  message: string;
  playlists: SpotifyPagingObject<SpotifyPlaylist>;
}> {
  const { country, limit = 20, offset = 0, timestamp } = props;

  if (limit && (limit < 1 || limit > 50)) {
    throw new Error("Limit must be between 1 and 50");
  }

  const response = await ctx.client["GET /browse/featured-playlists"]({
    country,
    limit,
    offset,
    timestamp,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting featured playlists: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
