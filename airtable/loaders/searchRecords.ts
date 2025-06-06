import type { AppContext } from "../mod.ts";
import type {
  ListRecordsOptions,
  ListRecordsResponse,
} from "../utils/types.ts";

interface Props extends Omit<ListRecordsOptions, "filterByFormula"> {
  /**
   * @title Base ID
   */
  baseId: string;

  /**
   * @title Table ID or Name
   */
  tableIdOrName: string;

  /**
   * @title Search Term
   * @description The term to search for in the specified fields.
   */
  searchTerm: string;

  /**
   * @title Fields to Search
   * @description Optional. Array of field names (or IDs) to search within. If empty, attempts to search in all text-based fields.
   */
  searchFields?: string[];
}

// Helper to escape search term for formula
function escapeAirtableFormulaValue(term: string): string {
  return term.replace(/(["\\'])/g, "\\$1");
}

/**
 * @title Search Airtable Records
 * @description Searches records in a table based on a search term and specified fields using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  const {
    baseId,
    tableIdOrName,
    searchTerm,
    searchFields,
    ...otherOptions
  } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  let filterByFormula = "";
  const escapedSearchTerm = escapeAirtableFormulaValue(searchTerm);

  if (searchFields && searchFields.length > 0) {
    filterByFormula = `OR(${
      searchFields.map((field) => `FIND("${escapedSearchTerm}", {${field}})`)
        .join(",")
    })`;
  } else {
    console.warn(
      "SearchRecords: searchFields not provided. The search might not be effective unless a custom filterByFormula is also passed.",
    );
  }

  const params: ListRecordsOptions = {
    ...otherOptions,
  };
  if (filterByFormula) {
    params.filterByFormula = filterByFormula;
  }

  const response = await ctx.client["GET /v0/:baseId/:tableIdOrName"]({
    ...params,
    baseId,
    tableIdOrName,
  });

  if (!response.ok) {
    throw new Error(`Error searching records: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
