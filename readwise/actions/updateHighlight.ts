import { AppContext } from "../mod.ts";
import type { Highlight, HighlightUpdatePayload } from "../client.ts";

export interface Props extends HighlightUpdatePayload {
  /**
   * @title Highlight ID
   * @description The ID of the highlight to update
   */
  id: number;
}

/**
 * @title Update Highlight
 * @description Updates an existing highlight in Readwise
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Highlight> => {
  const { id, ...updateData } = props;

  // Make the API request
  const response = await ctx.api["PATCH /highlights/:id"]({
    id,
  }, {
    body: updateData,
  });

  const data = await response.json();
  return data;
};

export default action;
