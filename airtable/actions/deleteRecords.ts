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
 * @description Deletes one or more records from a specified table.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ records: Array<{ id: string; deleted: boolean }> }> => {
  const { baseId, tableIdOrName, recordIds } = props;

  // The client expects searchParams: { "records[]": string[] }
  // The parameters to the client call should be flat, including URL params and searchParams
  const params = {
    baseId,
    tableIdOrName,
    "records[]": recordIds,
  };

  const response = await ctx.api["DELETE /v0/:baseId/:tableIdOrName"](params);
  return response.json();
};

export default action;
