import { AppContext } from "../../mod.ts";
import { SpotifyPagingObject, SpotifyPlaylist } from "../../client.ts";

interface Props {
  /**
   * @title Limit
   * @description Maximum number of playlists to return
   * @default 20
   */
  limit?: number;

  /**
   * @title Offset
   * @description Index of the first playlist to return
   * @default 0
   */
  offset?: number;
}

/**
 * @title Get User Playlists
 * @description Get playlists owned by the current user
 */
export default async function getUserPlaylists(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SpotifyPagingObject<SpotifyPlaylist>> {
  const { limit = 20, offset = 0 } = props;

  const response = await ctx.client["GET /me/playlists"]({
    limit,
    offset,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error getting user playlists: ${response.status} - ${errorText}`,
    );
  }

  return await response.json();
}
