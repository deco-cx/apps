import type { AppContext } from "../mod.ts";
import type { Table, UpdateTableBody, MCPResponse } from "../utils/types.ts";

interface Props {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The ID of the table to update.
   */
  tableId: string;

  /**
   * @title New Table Name
   * @description Optional. New name for the table.
   */
  name?: string;

  /**
   * @title New Table Description
   * @description Optional. New description for the table.
   */
  description?: string;

  /**
   * @title New Primary Field ID
   * @description Optional. ID of an existing field to be set as the new primary field.
   */
  primaryFieldId?: string;
}

/**
 * @title Update Airtable Table
 * @description Updates an existing table's name, description, or primary field using OAuth (Metadata API).
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MCPResponse<Table>> => {
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

  const { baseId, tableId, name, description, primaryFieldId } = props;

  const body: UpdateTableBody = {};
  if (name) body.name = name;
  if (description) body.description = description;
  if (primaryFieldId) body.primaryFieldId = primaryFieldId;

  if (Object.keys(body).length === 0) {
    return {
      error: "No updates provided for the table. Please specify name, description, or primaryFieldId.",
      status: 400,
    };
  }

  try {
    const response = await ctx.client
      ["PATCH /v0/meta/bases/:baseId/tables/:tableId"](
        { baseId, tableId },
        { body },
      );

    if (!response.ok) {
      return {
        error: `Error updating table: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
    };
  } catch (err) {
    return {
      error: `Error updating table: ${err instanceof Error ? err.message : String(err)}`,
      status: 500,
    };
  }
};

export default action;
