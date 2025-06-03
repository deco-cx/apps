import { AppContext } from "../mod.ts";
import { TransactionDetailsResponse } from "../client.ts";

export interface Props {
  /**
   * @title Transaction ID
   * @description ID of the transaction to retrieve details for
   */
  transactionId: string;
}

/**
 * @title Get Transaction Details
 * @description Retrieve comprehensive information about a transaction
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TransactionDetailsResponse> => {
  const { transactionId } = props;

  // First, authenticate to get the token
  const authResult = await ctx.getToken();
  const token = authResult.token;

  // Then, get the transaction using the bearer token
  const response = await ctx.api["GET /v1/transaction/:transactionId"](
    { transactionId: transactionId },
    { headers: { "Authorization": `Bearer ${token}` } },
  );

  const result = await response.json();

  return result;
};

export default loader;
