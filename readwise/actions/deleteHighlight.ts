import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Highlight ID
   * @description The ID of the highlight to delete
   */
  id: number;
}

/**
 * @title Delete Highlight
 * @description Deletes a highlight from Readwise
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<void> => {
  const { id } = props;

  // Make the API request
  await ctx.api["DELETE /highlights/:id"]({ id });

  // This endpoint returns 204 No Content, so no response body to parse
  return;
};

export default action;
