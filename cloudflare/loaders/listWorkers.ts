import { AppContext } from "../mod.ts";
import { ListWorkersResponse } from "../client.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;
}

/**
 * @title List Workers
 * @description Fetch a list of all Workers in your Cloudflare account
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ListWorkersResponse> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;

  const response = await ctx.api["GET /accounts/:account_id/workers/scripts"]({
    account_id: accountId,
  });

  const result = await response.json();
  return result;
};

export default loader;
