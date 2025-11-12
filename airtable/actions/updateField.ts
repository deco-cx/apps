import type { AppContext } from "../mod.ts";
import type { Field, MCPResponse, UpdateFieldBody } from "../utils/types.ts";

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
): Promise<MCPResponse<Field>> => {
  if (!ctx.client) {
    return {
      error: "OAuth authentication is required",
      status: 401,
    };
  }

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return {
      error: validationResult.message || "Access denied",
      status: 403,
    };
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
    return {
      error:
        "No updates provided for the field. Please specify name or description.",
      status: 400,
    };
  }

  try {
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
        return {
          error:
            `Field name "${name}" already exists in this table or is empty. Please choose a different name.`,
          status: 422,
          details: { type: "DUPLICATE_OR_EMPTY_FIELD_NAME" },
        };
      }

      return {
        error: `Error updating field: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
    };
  } catch (err) {
    return {
      error: `Error updating field: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }
};

export default action;
