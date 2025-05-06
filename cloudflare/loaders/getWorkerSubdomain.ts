import { AppContext } from "../mod.ts";
import { WorkerSubdomainResponse } from "../client.ts";

export interface Props {
  /**
   * @title Account ID
   * @description Use a specific account ID (overrides app settings)
   */
  accountId?: string;
}

/**
 * @title Get Worker Subdomain
 * @description Returns the Workers subdomain for an account
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<WorkerSubdomainResponse> => {
  // Use the provided account ID or fall back to the one in app context
  const accountId = props.accountId || ctx.accountId;

  // Make the API request
  const response = await ctx.api["GET /accounts/:account_id/workers/subdomain"](
    {
      account_id: accountId,
    },
  );

  return await response.json();
};

export default loader;
