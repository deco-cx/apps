import { AppContext } from "../../mod.ts";
import { SpotifyArtist, SpotifyPagingObject } from "../../client.ts";

interface Props {
  /**
   * @title Time Range
   * @description Time period to calculate top artists
   * @default medium_term
   */
  time_range?: "short_term" | "medium_term" | "long_term";

  /**
   * @title Limit
   * @description Maximum number of artists to return (1-50)
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first artist to return
   * @default 0
   */
  offset?: number;
}

/**
 * @title Get Top Artists
 * @description Get the user's most listened artists
 */
export default async function getTopArtists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<SpotifyArtist>> {
  const { time_range = "medium_term", limit = 20, offset = 0 } = props;

  if (limit && (limit < 1 || limit > 50)) {
    throw new Error("Limit must be between 1 and 50");
  }

  const response = await ctx.client["GET /me/top/artists"]({
    time_range,
    limit,
    offset,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting top artists: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
