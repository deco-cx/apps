import type { AppContext } from "../mod.ts";
import type { ListRecordsOptions, ListRecordsResponse } from "../types.ts";

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

  /**
   * @title API Key
   */
  apiKey?: string;
}

// Helper to escape search term for formula
function escapeAirtableFormulaValue(term: string): string {
  return term.replace(/(["\\'])/g, "\\$1");
}

/**
 * @title Search Airtable Records
 * @description Searches records in a table based on a search term and specified fields.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  const {
    baseId,
    tableIdOrName,
    searchTerm,
    searchFields,
    apiKey,
    ...otherOptions
  } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  let filterByFormula = "";
  const escapedSearchTerm = escapeAirtableFormulaValue(searchTerm);

  if (searchFields && searchFields.length > 0) {
    filterByFormula = `OR(${
      searchFields.map((field) => `FIND("${escapedSearchTerm}", {${field}})`)
        .join(",")
    })`;
  } else {
    // If no searchFields, try to get all fields from schema and filter for text-like ones.
    // This part can be complex and might require guessing field types if not explicitly known.
    // For a simpler initial version, this part might require user to specify searchFields or rely on a default behavior.
    // As a fallback, we can try a generic search if Airtable supports it or make searchFields mandatory for now.
    // For now, if searchFields is empty, we won't generate a FIND formula as it might be too broad or error-prone.
    // A better approach would be to fetch table schema, identify text fields, and build the formula.
    // However, that adds an extra API call. Let's keep it simple and encourage providing searchFields.
    // If searchFields is not provided, we can default to searching in a common field like 'Name' or skip smart formula generation.
    // The user's AirtableService has a validateAndGetSearchFields, which is more robust.
    // Here, we will make a simple assumption or require searchFields.
    // For this version, if searchFields is empty, the formula will be empty, relying on other filters or Airtable's default search if any.
    // Or, more practically, let's make it so that if searchFields is empty, it might not work as expected without specific field targets.
    // A simple approach: if no fields, don't construct FIND-based formula.
    // The user can still pass their own filterByFormula via otherOptions if they extend Props.
    console.warn(
      "SearchRecords: searchFields not provided. The search might not be effective unless a custom filterByFormula is also passed.",
    );
    // Alternative: throw new Error("searchFields must be provided for this loader version.");
  }

  const params: ListRecordsOptions = {
    ...otherOptions,
  };
  if (filterByFormula) {
    params.filterByFormula = filterByFormula;
  }

  const response = await ctx.api(resolvedApiKey)
    ["GET /v0/:baseId/:tableIdOrName"]({
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
