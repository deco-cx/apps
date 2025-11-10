import type { AppContext } from "../mod.ts";
import type { MCPResponse } from "../utils/types.ts";

interface Props {
  /**
   * @title Base ID
   * @description The base containing the table with records to delete
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The table containing the records to delete
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
): Promise<MCPResponse<{ records: { id: string; deleted: boolean }[] }>> => {
  if (!ctx.client) {
    return {
      error: "OAuth authentication is required",
      status: 401,
    };
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return {
      error: validationResult.message || "Access denied",
      status: 403,
    };
  }

  const { baseId, tableId, recordIds } = props;

  if (!recordIds || recordIds.length === 0) {
    return {
      error: "At least one record ID is required",
      status: 400,
    };
  }

  if (recordIds.length > 10) {
    return {
      error: "Maximum 10 records can be deleted at once",
      status: 400,
    };
  }

  const invalidIds = recordIds.filter((id) => !id.startsWith("rec"));
  if (invalidIds.length > 0) {
    return {
      error: `Invalid record IDs (must start with 'rec'): ${invalidIds.join(", ")}`,
      status: 400,
    };
  }

  try {
    const response = await ctx.client["DELETE /v0/:baseId/:tableId"](
      { baseId, tableId, "records[]": recordIds },
    );

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Error deleting records: ${errorText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
    };
  } catch (err) {
    return {
      error: `Error deleting records: ${err instanceof Error ? err.message : String(err)}`,
      status: 500,
    };
  }
};

export default action;
