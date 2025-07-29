import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifyTrack } from "../../client.ts";

interface Props {
  /**
   * @title Limit
   * @description Maximum number of tracks to return
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first track to return
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
 * @title Get Saved Tracks
 * @description Get tracks saved in the user's library
 */
export default async function getSavedTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<{ added_at: string; track: SpotifyTrack }>> {
  const { limit = 20, offset = 0, market } = props;

  const response = await ctx.client["GET /me/tracks"]({
    limit,
    offset,
    market,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting saved tracks: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
