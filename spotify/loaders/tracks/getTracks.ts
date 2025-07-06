import { AppContext } from "../../mod.ts";
import { SpotifyTrack } from "../../client.ts";

interface Props {
  /**
   * @title Track IDs
   * @description List of track IDs (maximum 50, comma-separated)
   */
  ids: string;

  /**
   * @title Market
   * @description Country code (market) to filter availability
   */
  market?: string;
}

/**
 * @title Get Tracks
 * @description Get information about multiple tracks
 */
export default async function getTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: SpotifyTrack[] }> {
  const { ids, market } = props;

  const response = await ctx.client["GET /tracks"]({
    ids,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error getting tracks: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  // Wrap array response in object for consistency
  return { data: result.tracks };
}
