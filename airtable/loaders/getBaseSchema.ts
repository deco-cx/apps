import type { AppContext } from "../mod.ts";
import type { BaseSchemaResponse } from "../types.ts";

interface Props {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;
  offset?: string;
  /**
   * @title API Key
   */
  apiKey?: string;
}

/**
 * @title Get Airtable Base Schema
 * @description Fetches the schema (tables, fields, etc.) for a specific Airtable base.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<BaseSchemaResponse | Response> => {
  const { baseId, offset, apiKey } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  const params: { baseId: string; offset?: string } = { baseId };
  if (offset) {
    params.offset = offset;
  }
  const response = await ctx.api(resolvedApiKey)
    ["GET /v0/meta/bases/:baseId/tables"](
      params,
    );

  if (!response.ok) {
    throw new Error(`Error getting base schema: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
