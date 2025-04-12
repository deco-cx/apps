import { AppContext } from "../mod.ts";
import type { HighlightCreateResponse, HighlightItem } from "../client.ts";

export interface Props {
  /**
   * @title Highlights
   * @description An array of highlights to create
   */
  highlights: HighlightItem[];
}

/**
 * @title Create Highlights
 * @description Saves highlights to a user's Readwise account
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<HighlightCreateResponse[]> => {
  const { highlights } = props;

  // Make the API request
  const response = await ctx.api["POST /highlights/"]({}, {
    body: { highlights },
  });

  const data = await response.json();
  return data;
};

export default action;
