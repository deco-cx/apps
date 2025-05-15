import type { AppContext } from "../mod.ts";
import type { CreateFieldBody, Field } from "../types.ts";

// Props will be CreateFieldBody plus baseId and tableId
interface Props extends CreateFieldBody {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The ID of the table to add the field to.
   */
  tableId: string;
  // name, type, description, options are inherited from CreateFieldBody
}

/**
 * @title Create Airtable Field
 * @description Creates a new field in a specified table (Metadata API).
 * @see https://airtable.com/developers/web/api/create-field
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Field> => {
  const { baseId, tableId, name, type, description, options } = props;

  const body: CreateFieldBody = {
    name,
    type,
  };
  if (description) {
    body.description = description;
  }
  if (options) {
    body.options = options;
  }

  const response = await ctx.api
    ["POST /v0/meta/bases/:baseId/tables/:tableId/fields"](
      { baseId, tableId }, // URL params
      { body }, // Request body
    );

  if (!response.ok) {
    throw new Error(`Error creating field: ${response.statusText}`);
  }

  return response.json();
};

export default action;
