import type { AppContext } from "../mod.ts";
import type { CreateTableBody, Field, Table } from "../utils/types.ts";

interface Props {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table Name
   */
  name: string;

  /**
   * @title Table Description
   * @description Optional description for the new table.
   */
  description?: string;

  /**
   * @title Table Fields
   * @description Array of field definitions for the new table.
   * @see https://airtable.com/developers/web/api/field-model
   */
  fields: Array<Omit<Field, "id">>;

  /**
   * @title Primary Field ID
   * @description Optional. The ID of the field to be set as primary.
   */
  primaryFieldId?: string;
}

/**
 * @title Create Airtable Table
 * @description Creates a new table within a specified base using OAuth (Metadata API).
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Table | Response> => {
  const { baseId, name, description, fields, primaryFieldId } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const body: CreateTableBody = {
    name,
    fields: fields as Field[],
  };

  if (description) {
    body.description = description;
  }

  if (primaryFieldId) {
    body.primaryFieldId = primaryFieldId;
  }

  const response = await ctx.client["POST /v0/meta/bases/:baseId/tables"](
    { baseId },
    { body },
  );

  if (!response.ok) {
    throw new Error(`Error creating table: ${response.statusText}`);
  }

  return response.json();
};

export default action;
