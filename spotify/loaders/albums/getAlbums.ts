import { AppContext } from "../../mod.ts";
import { SpotifyAlbum } from "../../client.ts";

interface Props {
  /**
   * @title Album IDs
   * @description List of album IDs (maximum 20, comma-separated)
   */
  ids: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;
}

/**
 * @title Get Albums
 * @description Get information about multiple albums
 */
export default async function getAlbums(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyAlbum[] }> {
  const { ids, market } = props;

  const response = await ctx.client["GET /albums"]({
    ids,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting albums: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.albums };
}
