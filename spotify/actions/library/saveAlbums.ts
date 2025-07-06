import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Album IDs
   * @description List of album IDs to save (maximum 50, comma-separated)
   */
  ids: string;
}

/**
 * @title Save Albums
 * @description Save albums to the user's library
 */
export default async function saveAlbums(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean }> {
  const { ids } = props;

  // Convert comma-separated string to array
  const albumIds = ids.split(",").map((id) => id.trim());

  const response = await ctx.client["PUT /me/albums"](
    {},
    {
      body: {
        ids: albumIds,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error saving albums: ${response.status} - ${errorText}`);
  }

  return { success: true };
}
