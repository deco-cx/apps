import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;

  /**
   * @title Script Name
   * @description The name of the Worker script to delete
   */
  scriptName: string;
}

/**
 * @title Delete Worker Script
 * @description Delete a Cloudflare Worker script
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ success: boolean; message: string }> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;
  const { scriptName } = props;

  // Make API request to delete the worker script
  const response = await ctx.api
    ["DELETE /accounts/:account_id/workers/scripts/:script_name"]({
      account_id: accountId,
      script_name: scriptName,
    });

  const result = await response.json();

  if (result.success) {
    return {
      success: true,
      message: `Successfully deleted worker: ${scriptName}`,
    };
  } else {
    const errorMsg = result.errors.length > 0
      ? result.errors.map((e: any) => e.message).join(", ")
      : "Unknown error";

    return {
      success: false,
      message: `Failed to delete worker: ${errorMsg}`,
    };
  }
};

export default action;
