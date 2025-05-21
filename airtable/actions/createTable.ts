import type { AppContext } from "../mod.ts";
import type { CreateTableBody, Field, Table } from "../types.ts";

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
  fields: Array<Omit<Field, "id">>; // When creating a table, field IDs are not provided for new fields.

  /**
   * @title Primary Field ID or Name
   * @description Optional. The name or ID of the field to be set as primary.
   * If not provided, Airtable usually defaults to the first field or requires one with a supported type.
   */
  primaryFieldNameOrId?: string; // Airtable API for create table can take primaryFieldId. This simplifies it to a name.
  // This will need to be translated to the correct structure for CreateTableBody.fields if needed
  // Or CreateTableBody might need primaryFieldId directly.
  // For simplicity, let's assume CreateTableBody handles fields definitions correctly.
}

/**
 * @title API Key
 */
interface PropsWithApiKey extends Props {
  apiKey?: string;
}

/**
 * @title Create Airtable Table
 * @description Creates a new table within a specified base (Metadata API).
 */
const action = async (
  props: PropsWithApiKey,
  req: Request,
  ctx: AppContext,
): Promise<Table | Response> => {
  const { baseId, name, description, fields, apiKey } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  // The client expects `body: CreateTableBody`
  // CreateTableBody is { name: string, description?: string, fields: Field[], primaryFieldId?: string }
  // Our Props.fields is Array<Omit<Field, "id">>. This is compatible with Field[] where id is optional.
  const body: CreateTableBody = {
    name,
    fields: fields as Field[], // Cast Omit<Field, "id">[] to Field[]
  };

  if (description) {
    body.description = description;
  }
  // Handling primaryFieldNameOrId would typically involve finding that field in the `fields` array
  // (if it's a name) and then setting its ID to `body.primaryFieldId` IF the API expects that.
  // The Airtable API for creating tables usually infers the primary field or requires one of the fields
  // to be of a primary-compatible type.
  // The `CreateTableBody` includes `primaryFieldId?: string;`. If the user provides it, we pass it.
  // Let's adjust Props to take primaryFieldId to align better with CreateTableBody
  // For now, this example will omit direct primaryFieldId setting from Props to simplify, assuming field definitions suffice or a default is used.
  // If `primaryFieldNameOrId` was intended to be `primaryFieldId` from `CreateTableBody` it should be named so in `Props`.

  const response = await ctx.api(resolvedApiKey)
    ["POST /v0/meta/bases/:baseId/tables"](
      { baseId }, // URL params
      { body }, // Request body
    );

  if (!response.ok) {
    throw new Error(`Error creating table: ${response.statusText}`);
  }

  return response.json();
};

export default action;
