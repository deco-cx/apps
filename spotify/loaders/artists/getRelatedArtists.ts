import { AppContext } from "../../mod.ts";
import { SpotifyArtist } from "../../client.ts";

interface Props {
  /**
   * @title Artist ID
   * @description Spotify artist ID
   */
  id: string;
}

/**
 * @title Get Related Artists
 * @description Get artists related to a specific artist
 */
export default async function getRelatedArtists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyArtist[] }> {
  const { id } = props;

  const response = await ctx.client["GET /artists/:id/related-artists"]({
    id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting related artists: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.artists };
}
