import { AppContext } from "../../mod.ts";
import { SpotifyExternalUrls, SpotifyTrack } from "../../client.ts";

interface Props {
  /**
   * @title Limit
   * @description Maximum number of tracks to return (1-50)
   * @default 20
   */
  limit?: number;

  /**
   * @title After
   * @description Unix timestamp in ms - returns tracks played after this time
   */
  after?: number;

  /**
   * @title Before
   * @description Unix timestamp in ms - returns tracks played before this time
   */
  before?: number;
}

/**
 * @title Get Recently Played
 * @description Get tracks recently played by the user
 */
export default async function getRecentlyPlayed(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{
  items: {
    track: SpotifyTrack;
    played_at: string;
    context: {
      type: "artist" | "playlist" | "album" | "show";
      href: string;
      external_urls: SpotifyExternalUrls;
      uri: string;
    } | null;
  }[];
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}> {
  const { limit = 20, after, before } = props;

  if (limit && (limit < 1 || limit > 50)) {
    throw new Error("Limit must be between 1 and 50");
  }

  const response = await ctx.client["GET /me/player/recently-played"]({
    limit,
    after,
    before,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting recently played tracks: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
