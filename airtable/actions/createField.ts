import type { AppContext } from "../mod.ts";
import type { CreateFieldBody, Field, MCPResponse } from "../utils/types.ts";

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
}

/**
 * @name Create_New_Field
 * @title Create Airtable Field
 * @description Creates multiple records. See Field types for supported field types, the recording format for field options, and other specifications for specific field types. Supported field types have a recording format displayed.
 * @see https://airtable.com/developers/web/api/create-field
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

  try {
    const response = await ctx.client
      ["POST /v0/meta/bases/:baseId/tables/:tableId/fields"](
        { baseId, tableId },
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
        error: `Error creating field: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
    };
  } catch (err) {
    return {
      error: `Error creating field: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }
};

export default action;
