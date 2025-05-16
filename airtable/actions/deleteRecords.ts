import type { AppContext } from "../mod.ts";

interface Props {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID or Name
   */
  tableIdOrName: string;

  /**
   * @title Record IDs to Delete
   * @description An array of record IDs to be deleted.
   */
  recordIds: string[];

  /**
   * @title API Key
   */
  apiKey?: string;
}

/**
 * @title Delete Airtable Records
 * @description Deletes one or more records from a specified table.
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{ records: Array<{ id: string; deleted: boolean }> } | Response> => {
  const { baseId, tableIdOrName, recordIds, apiKey } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  // The client expects searchParams: { "records[]": string[] }
  // The parameters to the client call should be flat, including URL params and searchParams
  const params = {
    baseId,
    tableIdOrName,
    "records[]": recordIds,
  };

  const response = await ctx.api(resolvedApiKey)
    ["DELETE /v0/:baseId/:tableIdOrName"](
      params,
    );

  if (!response.ok) {
    throw new Error(`Error deleting records: ${response.statusText}`);
  }

  return response.json();
};

export default action;
