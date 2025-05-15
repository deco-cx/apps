import type { AppContext } from "../mod.ts";
import type { BaseSchemaResponse } from "../types.ts";

interface Props {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;
  offset?: string;
}

/**
 * @title Get Airtable Base Schema
 * @description Fetches the schema (tables, fields, etc.) for a specific Airtable base.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BaseSchemaResponse> => {
  const { baseId, offset } = props;
  const params: { baseId: string; offset?: string } = { baseId };
  if (offset) {
    params.offset = offset;
  }
  const response = await ctx.api["GET /v0/meta/bases/:baseId/tables"](params);
  return response.json();
};

export default loader;
