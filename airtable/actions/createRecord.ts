import type { AppContext } from "../mod.ts";
import type { AirtableRecord, FieldSet } from "../utils/types.ts";

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
   * @title Record Fields
   * @description The fields for the new record.
   */
  fields: FieldSet;

  /**
   * @title Typecast
   * @description Optional. If true, Airtable will attempt to convert cell values to the appropriate type.
   */
  typecast?: boolean;
}

/**
 * @name Create_New_Record
 * @title Create Airtable Record
 * @description Creates multiple records. Your request body must include an array of up to 10 record objects. Each of these objects must have a key whose value is an internal object containing the cell values ​​of your record, indexed by field ID.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AirtableRecord | Response> => {
  const { baseId, tableId, fields, typecast } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const body = {
    fields,
    ...(typecast !== undefined && { typecast }),
  };

  const response = await ctx.client["POST /v0/:baseId/:tableId"](
    { baseId, tableId },
    { body },
  );

  if (!response.ok) {
    throw new Error(`Error creating record: ${response.statusText}`);
  }

  const config = await ctx.getConfiguration();
  await ctx.configure({
    ...config,
    permission: {
      ...config.permission,
      tables: [...(config.permission?.tables ?? []), { id: (await response.json()).id }],
    },
  });

  return response.json();
};

export default action;
