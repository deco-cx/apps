import { AppContext } from "../../mod.ts";
import { SpotifyArtist, SpotifyPagingObject } from "../../client.ts";

interface Props {
  /**
   * @title After
   * @description Cursor for pagination - ID of the last artist from the previous page
   */
  after?: string;

  /**
   * @title Limit
   * @description Maximum number of artists to return (1-50)
   * @default 20
   */
  limit?: number;
}

/**
 * @title Get Followed Artists
 * @description Get artists followed by the user
 */
export default async function getFollowedArtists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  artists: SpotifyPagingObject<SpotifyArtist>;
}> {
  const { after, limit = 20 } = props;

  if (limit && (limit < 1 || limit > 50)) {
    throw new Error("Limit must be between 1 and 50");
  }

  const response = await ctx.client["GET /me/following"]({
    type: "artist",
    after,
    limit,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting followed artists: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
