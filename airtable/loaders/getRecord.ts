import type { AppContext } from "../mod.ts";
import type { AirtableRecord } from "../types.ts";

interface Props {
  /**
   * @title API Key
   */
  apiKey?: string;

  /**
   * @title Base ID
   * @description The ID of the Airtable base.
   */
  baseId: string;

  /**
   * @title Table ID or Name
   * @description The ID or name of the table.
   */
  tableIdOrName: string;

  /**
   * @title Record ID
   * @description The ID of the record to retrieve.
   */
  recordId: string;
}

/**
 * @title Get Airtable Record
 * @description Fetches a single record by its ID from a specific table.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AirtableRecord | Response> => {
  const { baseId, tableIdOrName, recordId, apiKey } = props;

  const authHeader = req?.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  const response = await ctx.api(resolvedApiKey)
    ["GET /v0/:baseId/:tableIdOrName/:recordId"]({
      baseId,
      tableIdOrName,
      recordId,
    });

  if (!response.ok) {
    throw new Error(`Error getting record: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
