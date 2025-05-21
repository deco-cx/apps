import type { AppContext } from "../mod.ts";
import type { ListRecordsOptions, ListRecordsResponse } from "../types.ts";

interface Props extends ListRecordsOptions {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;

  /**
   * @title Table ID or Name
   * @description The ID or name of the table (e.g., tblXXXXXXXXXXXXXX or "Table Name").
   */
  tableIdOrName: string;

  /**
   * @title API Key
   */
  apiKey?: string;
}

/**
 * @title List Airtable Records
 * @description Fetches records from a specific table in an Airtable base.
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  const { baseId, tableIdOrName, apiKey, ...searchOptions } = props;

  const authHeader = req.headers.get("Authorization")?.split(" ")[1];
  const resolvedApiKey = authHeader || apiKey;

  if (!resolvedApiKey) {
    return new Response("API Key is required", { status: 403 });
  }

  // searchOptions já é do tipo ListRecordsOptions (ou um subconjunto dele)
  // Os parâmetros baseId e tableIdOrName são passados na URL.
  // O objeto passado para a API deve conter os parâmetros de path e os de query (searchOptions).
  const response = await ctx.api(resolvedApiKey)
    ["GET /v0/:baseId/:tableIdOrName"]({
      ...searchOptions, // Contém os parâmetros de ListRecordsOptions
      baseId, // Para o path parameter :baseId
      tableIdOrName, // Para o path parameter :tableIdOrName
    });

  if (!response.ok) {
    throw new Error(`Error listing records: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
