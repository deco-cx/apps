import type { AppContext } from "../mod.ts";
import type { Field, UpdateFieldBody } from "../utils/types.ts";

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
}

/**
 * @title Update Airtable Field
 * @description Updates an existing field's properties like name or description using OAuth (Metadata API).
 * @see https://airtable.com/developers/web/api/update-field
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Field | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return new Response(validationResult.message || "Access denied", {
      status: 403,
    });
  }

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

  const response = await ctx.client
    ["PATCH /v0/meta/bases/:baseId/tables/:tableId/fields/:fieldId"](
      { baseId, tableId, fieldId },
      { body },
    );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as {
      error?: { type?: string };
    };

    if (
      response.status === 422 &&
      errorData.error?.type === "DUPLICATE_OR_EMPTY_FIELD_NAME"
    ) {
      return new Response(
        JSON.stringify({
          error:
            `Field name "${name}" already exists in this table or is empty. Please choose a different name.`,
          type: "DUPLICATE_OR_EMPTY_FIELD_NAME",
        }),
        {
          status: 422,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: `Error updating field: ${response.statusText}`,
        status: response.status,
      }),
      {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  return response.json();
};

export default action;
