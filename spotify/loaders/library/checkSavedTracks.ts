import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Track IDs
   * @description Spotify track IDs to check (maximum 50)
   */
  ids: string[];
}

/**
 * @title Check Saved Tracks
 * @description Check if specific tracks are saved in the user's library
 */
export default async function checkSavedTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ data: boolean[] }> {
  const { ids } = props;

  if (ids.length === 0) {
    return { data: [] };
  }

  if (ids.length > 50) {
    throw new Error("Maximum of 50 IDs allowed at once");
  }

  const response = await ctx.client["GET /me/tracks/contains"]({
    ids: ids.join(","),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Error checking saved tracks: ${response.status} - ${errorText}`,
    );
  }

  const result = await response.json();
  return { data: result };
}
