import type { AppContext } from "../mod.ts";
import { isValidRecordId } from "../utils/helpers.ts";

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
   * @description An array of record IDs to be deleted. Record IDs must start with 'rec'.
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

  // Validar record IDs
  const invalidIds = recordIds.filter((id) => !isValidRecordId(id));
  if (invalidIds.length > 0) {
    throw new Error(
      `Invalid record IDs (must start with 'rec'): ${invalidIds.join(", ")}`,
    );
  }

  if (recordIds.length === 0) {
    throw new Error("At least one record ID is required");
  }

  if (recordIds.length > 10) {
    throw new Error("Maximum 10 records can be deleted at once");
  }

  const response = await ctx.client["DELETE /v0/:baseId/:tableIdOrName"](
    { baseId, tableIdOrName, "records[]": recordIds },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error deleting records: ${errorText}`);
  }

  return response.json();
};

export default action;
