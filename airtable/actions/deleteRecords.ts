import type { AppContext } from "../mod.ts";
import { isValidRecordId } from "../utils/helpers.ts";

interface Props {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID
   */
  tableId: string;

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
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return new Response(validationResult.message || "Access denied", {
      status: 403,
    });
  }

  const { baseId, tableId, recordIds } = props;

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

  const response = await ctx.client["DELETE /v0/:baseId/:tableId"](
    { baseId, tableId, "records[]": recordIds },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error deleting records: ${errorText}`);
  }

  return response.json();
};

export default action;
