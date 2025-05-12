import type { AppContext } from "../mod.ts";
import type { SheetDbNpsRow, SheetDbNpsQuery } from "../client.ts";

export interface Props extends SheetDbNpsQuery {}

/**
 * @title Read All NPS Rows
 * @description Fetch all rows from the SheetDB spreadsheet, with optional filters.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<SheetDbNpsRow[]> => {
  const response = await ctx.api["GET /"]({ ...props });
  return await response.json();
};

export default loader; 