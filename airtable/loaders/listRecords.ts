import type { AppContext } from "../mod.ts";
import type {
  ListRecordsResponse,
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
   * @title Table ID
   * @description The ID of the table within the base.
   * @title Table ID
   * @description The ID of the table within the base.
   */
  tableId: string;

  /**
   * @title Max Records
   * @description Maximum number of records to return.
   */
  maxRecords?: number;

  /**
   * @title Page Size
   * @description Number of records per page.
   */
  pageSize?: number;

  /**
   * @title Offset
   * @description Pagination offset for listing records.
   */
  offset?: string;

  /**
   * @title View
   * @description The name or ID of the view to use.
   */
  view?: string;

  /**
   * @title Filter By Formula
   * @description Airtable formula to filter records.
   */
  filterByFormula?: string;

  /**
   * @title Sort
   * @description Array of sort objects to order the records.
   */
  sort?: Array<{
    field: string;
    direction: "asc" | "desc";
  }>;

  /**
   * @title Fields
   * @description Array of field names to include in the response.
   */
  fields?: string[];
}

/**
 * @name List_Table_Records
 * @title List Airtable Records
 * @description Fetches records from a specific table using OAuth with optional filtering and sorting.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const propsValidationResult: ValidationResult = await ctx.invoke["airtable"]
    .loaders.permissioning.validatePermissions({
      mode: "filter",
      props: { ...props, tableIdOrName: props.tableId },
    });

  if ("error" in propsValidationResult && propsValidationResult.error) {
    return new Response(propsValidationResult.error, { status: 403 });
  }

  const filterResult = propsValidationResult as ValidationFilterResult;
  const validatedProps = (filterResult.filteredProps || props) as Props;

  const response = await ctx.client["GET /v0/:baseId/:tableId"](
    validatedProps,
  );

  if (!response.ok) {
    throw new Error(`Error listing records: ${response.statusText}`);
  }

  return await response.json();
};

export default loader;
