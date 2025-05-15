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
}

/**
 * @title List Airtable Records
 * @description Fetches records from a specific table in an Airtable base.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse> => {
  const { baseId, tableIdOrName, ...searchOptions } = props;

  // searchOptions já é do tipo ListRecordsOptions (ou um subconjunto dele)
  // Os parâmetros baseId e tableIdOrName são passados na URL.
  // O objeto passado para a API deve conter os parâmetros de path e os de query (searchOptions).
  const response = await ctx.api["GET /v0/:baseId/:tableIdOrName"]({
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
