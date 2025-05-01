import { AppContext } from "../mod.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;

  /**
   * @title Script Name
   * @description The name of the Worker script to fetch
   */
  scriptName: string;
}

/**
 * @title Get Worker Script Content
 * @description Fetch the content of a specific Worker script
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<string> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;
  const { scriptName } = props;

  const response = await ctx.api
    ["GET /accounts/:account_id/workers/scripts/:script_name"]({
      account_id: accountId,
      script_name: scriptName,
    });

  // The response is the script content as text
  return await response.text();
};

export default loader;
