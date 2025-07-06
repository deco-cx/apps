import { AppContext } from "../../mod.ts";
import { SpotifyTrack } from "../../client.ts";

interface Props {
  /**
   * @title Track ID
   * @description Spotify track ID
   */
  id: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;
}

/**
 * @title Get Track
 * @description Get detailed information about a specific track
 */
export default async function getTrack(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyTrack> {
  const { id, market } = props;

  const response = await ctx.client["GET /tracks/:id"]({
    id,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting track: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
