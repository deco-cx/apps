import type { AppContext } from "../mod.ts";
import type { AirtableRecord } from "../utils/types.ts";
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
   * @title Record ID
   * @description The ID of the record to retrieve.
   */
  recordId: string;
}

/**
 * @title Get Airtable Record
 * @description Fetches a specific record from an Airtable table using OAuth.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<AirtableRecord | Response> => {
  if (!ctx.client) {
    return new Response("OAuth authentication is required", { status: 401 });
  }

  const filteredProps = filterProps(ctx, props);
  if (filteredProps instanceof Response) {
    return filteredProps;
  }

  const response = await ctx.client["GET /v0/:baseId/:tableIdOrName/:recordId"](
    filteredProps as Props,
  );

  if (!response.ok) {
    throw new Error(`Error getting record: ${response.statusText}`);
  }

  return await response.json();
};

export default loader;
