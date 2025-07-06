import { AppContext } from "../../mod.ts";

interface Props {
  /**
   * @title Album IDs
   * @description Comma-separated list of Spotify album IDs to save
   */
  ids: string;
}

/**
 * @title Save Albums to Library
 * @description Save one or more albums to the current user's library
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { ids } = props;

  // Split the comma-separated IDs and clean them
  const albumIds = ids.split(",").map((id) => id.trim());

  // Use the albumIds in the API call
  await ctx.state.api["PUT /me/albums"]({}, {
    body: { ids: albumIds }
  });
};

export default action;