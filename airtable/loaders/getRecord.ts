import type { AppContext } from "../mod.ts";
import type { AirtableRecord } from "../utils/types.ts";

interface Props {
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
 * @description Fetches a single record by its ID from a specific table using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AirtableRecord | Response> => {
  const { baseId, tableIdOrName, recordId } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const response = await ctx.client["GET /v0/:baseId/:tableIdOrName/:recordId"](
    {
      baseId,
      tableIdOrName,
      recordId,
    },
  );

  if (!response.ok) {
    throw new Error(`Error getting record: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
