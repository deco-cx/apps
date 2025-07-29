import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Track IDs
   * @description Spotify track IDs to save (maximum 50)
   */
  ids: string[];
}

/**
 * @title Save Tracks
 * @description Save tracks to the user's library
 */
export default async function saveTracks(
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

  const response = await ctx.client["PUT /me/tracks"](
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
    throw new Error(`Error saving tracks: ${response.status} - ${errorText}`);
  }

  return { success: true };
}
