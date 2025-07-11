import { AppContext } from "../../mod.ts";
import { SpotifyAlbum } from "../../client.ts";

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
}

/**
 * @title Get Album
 * @description Get detailed information about a specific album
 */
export default async function getAlbum(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyAlbum> {
  const { id, market } = props;

  const response = await ctx.client["GET /albums/:id"]({
    id,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting album: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
