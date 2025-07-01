import type { AppContext } from "../mod.ts";
import type { CreateTableBody, Table } from "../utils/types.ts";
import { mapTableFields } from "../utils/helpers.ts";

// Tipos específicos de campo que o Airtable aceita
type AirtableFieldType =
  | "singleLineText"
  | "email"
  | "url"
  | "multilineText"
  | "number"
  | "percent"
  | "currency"
  | "singleSelect"
  | "multipleSelects"
  | "singleCollaborator"
  | "multipleCollaborators"
  | "multipleRecordLinks"
  | "date"
  | "dateTime"
  | "phoneNumber"
  | "multipleAttachments"
  | "checkbox"
  | "formula"
  | "createdTime"
  | "rollup"
  | "count"
  | "lookup"
  | "createdBy"
  | "lastModifiedTime"
  | "lastModifiedBy"
  | "button";

interface TableField {
  /**
   * @title Field Name
   * @description Name of the field (required)
   */
  name: string;

  /**
   * @title Field Type
   * @description Type of the field
   * @default "singleLineText"
   */
  type: AirtableFieldType;

  /**
   * @title Description
   * @description Optional description for the field
   */
  description?: string;

  /**
   * @title Options
   * @description Field-specific options (for select fields, etc.)
   */
  options?: {
    choices?: Array<{
      name: string;
      color?: string;
    }>;
  };
}

interface Props {
  /**
   * @title Base ID
   * @description The ID of the base where the table will be created
   */
  baseId: string;

  /**
   * @title Table Name
   * @description Name of the new table
   */
  name: string;

  /**
   * @title Table Description
   * @description Optional description for the new table
   */
  description?: string;

  /**
   * @title Table Fields
   * @description Array of field definitions for the new table. At least one field is required.
   * @minItems 1
   */
  fields: TableField[];
}

/**
 * @name Create_New_Table
 * @title Create Airtable Table
 * @description Creates a new table within a specified base using OAuth (Metadata API).
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
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return new Response(validationResult.message || "Access denied", {
      status: 403,
    });
  }

  const { baseId, name, description, fields } = props;

  if (!name || name.trim() === "") {
    throw new Error("Table name is required");
  }

  if (!fields || fields.length === 0) {
    throw new Error("At least one field is required");
  }

  const mappedFields = mapTableFields(fields);

  const body: CreateTableBody = {
    name: name.trim(),
    fields: mappedFields,
  };

  if (description && description.trim() !== "") {
    body.description = description.trim();
  }

  const response = await ctx.client["POST /v0/meta/bases/:baseId/tables"](
    { baseId },
    { body },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error creating table: ${errorText}`);
  }

  const table = await response.json();

  await ctx.invoke["airtable"].actions.permissioning.addNewPermitions({
    tables: [
      {
        id: table.id,
        name: table.name,
        baseId: baseId,
      },
    ],
  });

  return table;
};

export default action;
