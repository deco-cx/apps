import type { AppContext } from "../mod.ts";
import type {
  BaseSchemaResponse,
  ValidationFilterResult,
  ValidationResult,
} from "../utils/types.ts";

interface Props extends Record<string, unknown> {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;

  /**
   * @title Offset
   * @description Pagination offset for listing tables
   */
  offset?: string;
}

/**
 * @name Get_Base_Schema
 * @title Get Airtable Base Schema
 * @description Fetches the schema (tables, fields, etc.) for a specific Airtable base using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<BaseSchemaResponse | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const propsValidationResult: ValidationResult = await ctx.invoke["airtable"]
    .loaders.permissioning.validatePermissions({
      mode: "filter",
      props: props,
    });

  if ("error" in propsValidationResult && propsValidationResult.error) {
    return new Response(propsValidationResult.error, { status: 403 });
  }

  const propsFilterResult = propsValidationResult as ValidationFilterResult;
  const { baseId, offset } =
    (propsFilterResult.filteredProps || props) as Props;

  const params: { baseId: string; offset?: string } = { baseId };
  if (offset) {
    params.offset = offset;
  }

  const response = await ctx.client["GET /v0/meta/bases/:baseId/tables"](
    params,
  );

  if (!response.ok) {
    throw new Error(`Error getting base schema: ${response.statusText}`);
  }

  const data = await response.json();

  const responseValidationResult: ValidationResult = await ctx
    .invoke["airtable"].loaders.permissioning.validatePermissions({
      mode: "filter",
      response: data,
    });

  if ("error" in responseValidationResult && responseValidationResult.error) {
    return new Response(responseValidationResult.error, { status: 403 });
  }

  const responseFilterResult =
    responseValidationResult as ValidationFilterResult;
  return (responseFilterResult.filteredResponse || data) as BaseSchemaResponse;
};

export default loader;
