import { AppContext } from "../mod.ts";
import { SheetDBQueryParams, SheetDBRow } from "../client.ts";

/**
 * @title Get Sheet Data
 * @description Fetch data from SheetDB with optional filtering and sorting
 */
const loader = async (
  props: SheetDBQueryParams,
  _req: Request,
  ctx: AppContext,
): Promise<SheetDBRow[]> => {
  const response = await ctx.api["GET /"]({
    ...props
  });

  return await response.json();
};

export default loader; 