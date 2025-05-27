import type { AppContext } from "../mod.ts";
import type { BaseSchemaResponse } from "../utils/types.ts";

interface Props {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;

  /**
   * @title Offset
   * @description Pagination offset for listing tables
   */
  offset?: string;
}

/**
 * @title Get Airtable Base Schema
 * @description Fetches the schema (tables, fields, etc.) for a specific Airtable base using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BaseSchemaResponse | Response> => {
  const { baseId, offset } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const params: { baseId: string; offset?: string } = { baseId };
  if (offset) {
    params.offset = offset;
  }

  const response = await ctx.client["GET /v0/meta/bases/:baseId/tables"](
    params,
  );

  if (!response.ok) {
    throw new Error(`Error getting base schema: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
