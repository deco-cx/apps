import { AppContext } from "../../mod.ts";
import { SpotifySearchResult } from "../../client.ts";

interface Props {
  /**
   * @title Query
   * @description Search term
   */
  q: string;

  /**
   * @title Type
   * @description Types of items to search for (comma-separated)
   * @default "track,artist,album,playlist"
   */
  type?: string;

  /**
   * @title Market
   * @description Country code (market) to filter results
   */
  market?: string;

  /**
   * @title Limit
   * @description Maximum number of results per type
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first result
   * @default 0
   */
  offset?: number;

  /**
   * @title Include External
   * @description Whether to include external results (audio)
   */
  include_external?: string;
}

/**
 * @title Search
 * @description Search for artists, albums, tracks, playlists and other content on Spotify
 */
export default async function search(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifySearchResult> {
  const {
    q,
    type = "track,artist,album,playlist",
    market,
    limit = 20,
    offset = 0,
    include_external,
  } = props;

  const response = await ctx.client["GET /search"]({
    q,
    type,
    market,
    limit,
    offset,
    include_external,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Search error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
