import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifySimplifiedAlbum } from "../../client.ts";

interface Props {
  /**
   * @title Artist ID
   * @description Spotify artist ID
   */
  id: string;

  /**
   * @title Include Groups
   * @description Types of albums to include (album, single, appears_on, compilation)
   * @default "album,single"
   */
  include_groups?: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;

  /**
   * @title Limit
   * @description Maximum number of albums to return
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first album to return
   * @default 0
   */
  offset?: number;
}

/**
 * @title Get Artist Albums
 * @description Get albums from a specific artist
 */
export default async function getArtistAlbums(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<SpotifySimplifiedAlbum>> {
  const {
    id,
    include_groups = "album,single",
    market,
    limit = 20,
    offset = 0,
  } = props;

  const response = await ctx.client["GET /artists/:id/albums"]({
    id,
    include_groups,
    market,
    limit,
    offset,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting artist albums: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
