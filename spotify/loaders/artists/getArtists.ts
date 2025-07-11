import { AppContext } from "../../mod.ts";
import { SpotifyArtist } from "../../client.ts";

interface Props {
  /**
   * @title Artist IDs
   * @description List of artist IDs (maximum 50, comma-separated)
   */
  ids: string;
}

/**
 * @title Get Artists
 * @description Get information about multiple artists
 */
export default async function getArtists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyArtist[] }> {
  const { ids } = props;

  const response = await ctx.client["GET /artists"]({
    ids,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting artists: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.artists };
}
