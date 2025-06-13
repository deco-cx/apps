import type { AppContext } from "../mod.ts";
import type { ListBasesResponse } from "../utils/types.ts";

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
): Promise<ListBasesResponse | Response> => {
  const { offset } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const response = await ctx.client["GET /v0/meta/bases"](
    offset ? { offset: offset } : {},
  );

  if (!response.ok) {
    throw new Error(`Error listing bases: ${response.statusText}`);
  }

  const data = await response.json();

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "filter",
      response: data,
    }) as any;

  if (validationResult.error) {
    return new Response(validationResult.error, { status: 403 });
  }

  return (validationResult.filteredResponse || data) as ListBasesResponse;
};

export default loader;
