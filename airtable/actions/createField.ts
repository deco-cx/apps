import type { AppContext } from "../mod.ts";
import type { CreateFieldBody, Field } from "../utils/types.ts";

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
 * @title Create Airtable Field
 * @description Creates a new field in a specified table using OAuth (Metadata API).
 * @see https://airtable.com/developers/web/api/create-field
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Field | Response> => {
  const { baseId, tableId, name, type, description, options } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

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
        error: `Error creating field: ${response.statusText}`,
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
