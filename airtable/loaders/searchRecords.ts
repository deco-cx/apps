import type { AppContext } from "../mod.ts";
import type { ListRecordsResponse } from "../utils/types.ts";
import { filterProps } from "../utils/permission-checker.ts";

interface Props extends Record<string, unknown> {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;

  /**
   * @title Table ID or Name
   * @description The ID or name of the table within the base.
   */
  tableIdOrName: string;

  /**
   * @title Search Term
   * @description The term to search for in the specified fields.
   */
  searchTerm: string;

  /**
   * @title Search Fields
   * @description Array of field names to search in. If not provided, searches in all fields.
   */
  searchFields?: string[];

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
 * @title Search Airtable Records
 * @description Searches for records in a specific table using OAuth with optional field filtering.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const filteredProps = filterProps(ctx, props);
  if (filteredProps instanceof Response) {
    return filteredProps;
  }

  const { searchTerm, searchFields, ...otherProps } = filteredProps as Props;

  let filterByFormula = "";
  if (searchFields && searchFields.length > 0) {
    const fieldFormulas = searchFields.map(
      (field) => `SEARCH("${searchTerm}", {${field}})`,
    );
    filterByFormula = `OR(${fieldFormulas.join(",")})`;
  } else {
    filterByFormula = `SEARCH("${searchTerm}", {*})`;
  }

  const response = await ctx.client["GET /v0/:baseId/:tableIdOrName"]({
    ...otherProps,
    filterByFormula,
  });

  if (!response.ok) {
    throw new Error(`Error searching records: ${response.statusText}`);
  }

  return await response.json();
};

export default loader;
