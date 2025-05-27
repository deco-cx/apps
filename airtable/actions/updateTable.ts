import type { AppContext } from "../mod.ts";
import type { Table, UpdateTableBody } from "../types.ts";

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

  /**
   * @title API Key
   */
  apiKey?: string;
}

/**
 * @title Update Airtable Table
 * @description Updates an existing table's name, description, or primary field (Metadata API).
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Table | Response> => {
  const { baseId, tableId, name, description, primaryFieldId, apiKey } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  const body: UpdateTableBody = {};
  if (name) body.name = name;
  if (description) body.description = description;
  if (primaryFieldId) body.primaryFieldId = primaryFieldId;

  if (Object.keys(body).length === 0) {
    throw new Error(
      "No updates provided for the table. Please specify name, description, or primaryFieldId.",
    );
  }

  const response = await ctx.api(resolvedApiKey)
    ["PATCH /v0/meta/bases/:baseId/tables/:tableId"](
      { baseId, tableId }, // URL params
      { body }, // Request body
    );

  if (!response.ok) {
    throw new Error(`Error updating table: ${response.statusText}`);
  }

  return response.json();
};

export default action;
