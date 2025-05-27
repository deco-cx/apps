import { AppContext } from "../mod.ts";
import type { Highlight } from "../client.ts";

export interface Props {
  /**
   * @title Highlight ID
   * @description The ID of the highlight to fetch details for
   */
  id: number;
}

/**
 * @title Get Highlight Details
 * @description Fetches detailed information about a specific highlight
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Highlight> => {
  const { id } = props;

  // Make the API request
  const response = await ctx.api["GET /highlights/:id"]({ id });
  const data = await response.json();

  return data;
};

export default loader;
