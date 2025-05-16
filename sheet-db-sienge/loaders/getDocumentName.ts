import { AppContext } from "../mod.ts";
import { DocumentNameResponse } from "../client.ts";

/**
 * @title Get Document Name
 * @description Fetch the name of the document from SheetDB
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<DocumentNameResponse> => {
  const response = await ctx.api["GET /name"]({});

  return await response.json();
};

export default loader; 