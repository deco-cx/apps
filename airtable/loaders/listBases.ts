import type { AppContext } from "../mod.ts";
import type {
  ListBasesResponse,
  MCPResponse,
  ValidationFilterResult,
  ValidationResult,
} from "../utils/types.ts";

interface Props {
  /**
   * @title Offset
   * @description Pagination offset for listing bases
   */
  offset?: string;
}

/**
 * @name List_Bases
 * @title List Airtable Bases
 * @description Fetches a list of bases accessible with OAuth token.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<MCPResponse<ListBasesResponse>> => {
  const { offset } = props;

  if (!ctx.client) {
    return {
      error: "OAuth authentication is required",
      status: 401,
    };
  }

  try {
    const response = await ctx.client["GET /v0/meta/bases"](
      offset ? { offset: offset } : {},
    );

    if (!response.ok) {
      return {
        error: `Error listing bases: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();

    const validationResult: ValidationResult = await ctx.invoke["airtable"]
      .loaders.permissioning.validatePermissions({
        mode: "filter",
        response: data,
      });

    if ("error" in validationResult && validationResult.error) {
      return {
        error: validationResult.error,
        status: 403,
      };
    }

    const filterResult = validationResult as ValidationFilterResult;
    const filteredData =
      (filterResult.filteredResponse || data) as ListBasesResponse;

    return {
      data: filteredData,
    };
  } catch (err) {
    return {
      error: `Error listing bases: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }
};

export default loader;
