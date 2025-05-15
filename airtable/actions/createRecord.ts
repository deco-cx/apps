import type { AppContext } from "../mod.ts";
import type { AirtableRecord, FieldSet } from "../types.ts";

interface Props {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID or Name
   */
  tableIdOrName: string;

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
 * @title Create Airtable Record
 * @description Creates a new record in a specified table.
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AirtableRecord> => {
  const { baseId, tableIdOrName, fields, typecast } = props;

  const body = {
    fields,
    ...(typecast !== undefined && { typecast }),
  };

  const response = await ctx.api["POST /v0/:baseId/:tableIdOrName"](
    { baseId, tableIdOrName }, // URL parameters
    { body }, // Request body and other options
  );

  if (!response.ok) {
    throw new Error(`Error creating record: ${response.statusText}`);
  }

  return response.json();
};

export default action;
