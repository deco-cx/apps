import type { AppContext } from "../mod.ts";
import type { ListBasesResponse } from "../utils/types.ts";

interface Props {
  /**
   * @title Offset
   * @description Pagination offset for listing bases
   */
  offset?: string;
}

/**
 * @title List Airtable Bases
 * @description Fetches a list of bases accessible with OAuth token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListBasesResponse | Response> => {
  const { offset } = props;
  console.log(ctx.tokens);
  console.log("Listing bases");
  const response = await ctx.client["GET /v0/meta/bases"](
    offset ? { offset: offset } : {},
  );
  console.log("Bases listed");

  if (!response.ok) {
    throw new Error(`Error listing bases: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
