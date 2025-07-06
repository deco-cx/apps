import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Track IDs
   * @description Spotify track IDs to remove (maximum 50)
   */
  ids: string[];
}

/**
 * @title Remove Tracks
 * @description Remove tracks from the user's library
 */
export default async function removeTracks(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { ids } = props;

  if (ids.length === 0) {
    return { success: true };
  }

  if (ids.length > 50) {
    throw new Error("Maximum of 50 IDs allowed at once");
  }

  const response = await ctx.client["DELETE /me/tracks"](
    {
      ids: ids.join(","),
    },
    {
      body: {
        ids: ids,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error removing tracks: ${response.status} - ${errorText}`);
  }

  return { success: true };
}
