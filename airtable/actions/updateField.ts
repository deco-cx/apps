import type { AppContext } from "../mod.ts";
import type { Field, UpdateFieldBody } from "../types.ts";

// Props will be UpdateFieldBody plus baseId, tableId, and fieldId
interface Props extends UpdateFieldBody {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID
   */
  tableId: string;

  /**
   * @title Field ID
   * @description The ID of the field to update.
   */
  fieldId: string;
  // name, description are inherited from UpdateFieldBody
  // type and options changes are complex and generally not advised via simple updates.
}

/**
 * @title Update Airtable Field
 * @description Updates an existing field's properties like name or description (Metadata API).
 * @see https://airtable.com/developers/web/api/update-field
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Field> => {
  const { baseId, tableId, fieldId, name, description } = props;

  const body: UpdateFieldBody = {};
  if (name) {
    body.name = name;
  }
  if (description) {
    body.description = description;
  }

  if (Object.keys(body).length === 0) {
    throw new Error(
      "No updates provided for the field. Please specify name or description.",
    );
  }

  const response = await ctx.api
    ["PATCH /v0/meta/bases/:baseId/tables/:tableId/fields/:fieldId"](
      { baseId, tableId, fieldId }, // URL params
      { body }, // Request body
    );
  return response.json();
};

export default action;
