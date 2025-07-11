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
 * @title Get Artist
 * @description Get detailed information about a specific artist
 */
export default async function getArtist(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyArtist> {
  const { id } = props;

  const response = await ctx.client["GET /artists/:id"]({
    id,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting artist: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
