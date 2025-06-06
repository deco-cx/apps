import type { AppContext } from "../mod.ts";
import type {
  ListRecordsOptions,
  ListRecordsResponse,
} from "../utils/types.ts";

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
 * @description Fetches records from a specific table in an Airtable base using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListRecordsResponse | Response> => {
  const { baseId, tableIdOrName, ...searchOptions } = props;

  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const response = await ctx.client["GET /v0/:baseId/:tableIdOrName"]({
    ...searchOptions,
    baseId,
    tableIdOrName,
  });

  if (!response.ok) {
    throw new Error(`Error listing records: ${response.statusText}`);
  }

  return response.json();
};

export default loader;
