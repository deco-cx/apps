import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Album IDs
   * @description Spotify album IDs to remove (maximum 50)
   */
  ids: string[];
}

/**
 * @title Remove Albums
 * @description Remove albums from the user's library
 */
export default async function removeAlbums(
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

  const response = await ctx.client["DELETE /me/albums"](
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
    throw new Error(`Error removing albums: ${response.status} - ${errorText}`);
  }

  return { success: true };
}
