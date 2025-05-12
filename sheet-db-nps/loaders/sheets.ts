import type { AppContext } from "../mod.ts";

/**
 * @title List Sheets
 * @description Fetch the list of available sheets (tabs) in the spreadsheet.
 */
const loader = async (
  _props: unknown,
  _req: Request,
  ctx: AppContext,
): Promise<string[]> => {
  const response = await ctx.api["GET /sheets"]({});
  const data = await response.json();
  return data.sheets;
};

export default loader; 