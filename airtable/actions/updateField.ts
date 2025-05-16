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
  /**
   * @title API Key
   */
  apiKey?: string;
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
  req: Request,
  ctx: AppContext,
): Promise<Field | Response> => {
  const { baseId, tableId, fieldId, name, description, apiKey } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

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

  const response = await ctx.api(resolvedApiKey)
    ["PATCH /v0/meta/bases/:baseId/tables/:tableId/fields/:fieldId"](
      { baseId, tableId, fieldId }, // URL params
      { body }, // Request body
    );

  if (!response.ok) {
    throw new Error(`Error updating field: ${response.statusText}`);
  }

  return response.json();
};

export default action;
