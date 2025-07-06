import { AppContext } from "../../mod.ts";
import { SpotifyAlbum, SpotifyPagingObject } from "../../client.ts";

interface Props {
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

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;
}

/**
 * @title Get Saved Albums
 * @description Get albums saved in the user's library
 */
export default async function getSavedAlbums(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<{ added_at: string; album: SpotifyAlbum }>> {
  const { limit = 20, offset = 0, market } = props;

  const response = await ctx.client["GET /me/albums"]({
    limit,
    offset,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting saved albums: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
