import type { AppContext } from "../mod.ts";
import type { Table } from "../utils/types.ts";

interface TableConfig {
  /**
   * @title Table Name
   * @description Name of the table to be created
   */
  name: string;

  /**
   * @title Table Description
   * @description Optional description for the table
   */
  description?: string;

  /**
   * @title Table Fields
   * @description List of fields for the table. The first field will be used as the primary field.
   * @minItems 1
   */
  fields: Array<{
    /**
     * @title Field Name
     * @description Name of the field
     */
    name: string;

    /**
     * @title Field Type
     * @description Type of the field
     * @default "singleLineText"
     */
    type:
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

    /**
     * @title Field Description
     * @description Optional description for the field
     */
    description?: string;

    /**
     * @title Field Options
     * @description Field-specific options (for select fields, etc)
     */
    options?: {
      /**
       * @title Choices
       * @description List of options for select fields
       */
      choices?: Array<{
        /**
         * @title Choice Name
         * @description Name of the choice
         */
        name: string;

        /**
         * @title Choice Color
         * @description Optional color for the choice
         */
        color?: string;
      }>;

      /**
       * @title Color
       * @description Optional color for the field
       */
      color?: string;

      /**
       * @title Icon
       * @description Optional icon for the field
       */
      icon?: string;
    };
  }>;
}

interface Props {
  /**
   * @title Base Name
   * @description Name of the new base
   */
  name: string;

  /**
   * @title Workspace ID
   * @description ID of the workspace where the base will be created
   */
  workspaceId: string;

  /**
   * @title Tables
   * @description List of tables to be created in the base
   * @minItems 1
   */
  tables: TableConfig[];
}

/**
 * @name Create_New_Base
 * @title Create Airtable Base
 * @description Creates a new database with the given tables and returns the schema for the newly created database. At least one table and one field must be specified. The first field in the fields array will be used as the primary field of the table and must be a supported primary field type. Fields must have unique, case-insensitive names within the table.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ id: string; tables: Table[] } | Response> => {
  const { name, workspaceId, tables } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  if (!name || name.trim() === "") {
    throw new Error("Base name is required");
  }

  if (!workspaceId || workspaceId.trim() === "") {
    throw new Error("Workspace ID is required");
  }

  if (!tables || tables.length === 0) {
    throw new Error("At least one table is required");
  }

  tables.forEach((table, index) => {
    if (!table.fields || table.fields.length === 0) {
      throw new Error(`Table at index ${index} must have at least one field`);
    }
  });

  const body = {
    name: name.trim(),
    workspaceId: workspaceId.trim(),
    tables: tables.map((table) => ({
      name: table.name,
      ...(table.description && { description: table.description }),
      fields: table.fields.map((field) => ({
        name: field.name,
        type: field.type,
        ...(field.description && { description: field.description }),
        ...(field.options && { options: field.options }),
      })),
    })),
  };

  const response = await ctx.client["POST /v0/meta/bases"](
    {},
    { body },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error creating base: ${errorText}`);
  }

  const config = await ctx.getConfiguration();
  await ctx.configure({
    ...config,
    permission: {
      ...config.permission,
      bases: [...(config.permission?.bases ?? []), {
        id: (await response.json()).id,
      }],
    },
  });

  return response.json();
};

export default action;
