import type { AppContext } from "../mod.ts";
import type { AirtableRecord, MCPResponse } from "../utils/types.ts";

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
): Promise<MCPResponse<AirtableRecord>> => {
  if (!ctx.client) {
    return {
      error: "OAuth authentication is required",
      status: 401,
    };
  }

  try {
    const validationResult = await ctx.invoke["airtable"].loaders.permissioning
      .validatePermissions({
        mode: "check",
        baseId: props.baseId,
        tableIdOrName: props.tableId,
      });

    if (
      "hasPermission" in validationResult && !validationResult.hasPermission
    ) {
      return {
        error: validationResult.message || "Access denied",
        status: 403,
      };
    }

    const response = await ctx.client["GET /v0/:baseId/:tableId/:recordId"](
      props,
    );

    if (!response.ok) {
      return {
        error: `Error getting record: ${response.statusText}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return {
      data,
    };
  } catch (err) {
    return {
      error: `Error getting record: ${
        err instanceof Error ? err.message : String(err)
      }`,
      status: 500,
    };
  }
};

export default loader;
