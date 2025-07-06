import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Artist IDs
   * @description Artist IDs to follow (maximum 50)
   */
  ids: string[];
}

/**
 * @title Follow Artists
 * @description Follow specified artists
 */
export default async function followArtists(
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

  const response = await ctx.client["PUT /me/following"](
    {
      type: "artist",
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
    throw new Error(
      `Error following artists: ${response.status} - ${errorText}`,
    );
  }

  return { success: true };
}
