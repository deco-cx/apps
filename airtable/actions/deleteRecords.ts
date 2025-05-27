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
}

/**
 * @title Delete Airtable Records
 * @description Deletes one or more records from a specified table using OAuth.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ records: Array<{ id: string; deleted: boolean }> } | Response> => {
  const { baseId, tableIdOrName, recordIds } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const params = {
    baseId,
    tableIdOrName,
    "records[]": recordIds,
  };

  const response = await ctx.client["DELETE /v0/:baseId/:tableIdOrName"](
    params,
  );

  if (!response.ok) {
    throw new Error(`Error deleting records: ${response.statusText}`);
  }

  return response.json();
};

export default action;
