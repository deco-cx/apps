import type { AppContext } from "../mod.ts";
import type { AirtableRecord } from "../utils/types.ts";

interface Props extends Record<string, unknown> {
  /**
   * @title Base ID
   * @description The ID of the Airtable base (e.g., appXXXXXXXXXXXXXX).
   */
  baseId: string;

  /**
   * @title Table ID
   * @description The ID of the table within the base.
   */
  tableId: string;

  /**
   * @title Record ID
   * @description The ID of the record to retrieve.
   */
  recordId: string;
}

/**
 * @name Get_Table_Record
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

  const validationResult = await ctx.invoke["airtable"].loaders.permissioning
    .validatePermissions({
      mode: "check",
      baseId: props.baseId,
      tableIdOrName: props.tableId,
    });

  if ("hasPermission" in validationResult && !validationResult.hasPermission) {
    return new Response(validationResult.message || "Access denied", {
      status: 403,
    });
  }

  const response = await ctx.client["GET /v0/:baseId/:tableId/:recordId"](
    props,
  );

  if (!response.ok) {
    throw new Error(`Error getting record: ${response.statusText}`);
  }

  return await response.json();
};

export default loader;
