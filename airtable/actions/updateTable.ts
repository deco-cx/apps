import type { AppContext } from "../mod.ts";
import type { Table, UpdateTableBody } from "../utils/types.ts";

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
): Promise<Table | Response> => {
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

  const { baseId, tableId, name, description, primaryFieldId } = props;

  const body: UpdateTableBody = {};
  if (name) body.name = name;
  if (description) body.description = description;
  if (primaryFieldId) body.primaryFieldId = primaryFieldId;

  if (Object.keys(body).length === 0) {
    throw new Error(
      "No updates provided for the table. Please specify name, description, or primaryFieldId.",
    );
  }

  const response = await ctx.client
    ["PATCH /v0/meta/bases/:baseId/tables/:tableId"](
      { baseId, tableId },
      { body },
    );

  if (!response.ok) {
    throw new Error(`Error updating table: ${response.statusText}`);
  }

  return response.json();
};

export default action;
