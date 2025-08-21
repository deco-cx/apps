import { AppContext } from "../mod.ts";
import { Score } from "../client.ts";

export interface Props {
  /**
   * @title Transaction ID
   * @description The ID of the transaction to retrieve fraud scores for
   */
  transactionId: string;
}

/**
 * @title Get Fraud Score
 * @description Retrieve fraud scores for a specific transaction from ClearSale. If you get a 404, you can use the createFraudScore action to create the score first.
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ scores: Score[] }> => {
  const { transactionId } = props;

  // First, authenticate to get the token
  const authResult = await ctx.getToken();
  const token = authResult.token;

  // Then, get the fraud scores using the bearer token
  const response = await ctx.api["GET /v1/transaction/:transactionId/scores"](
    { transactionId },
    { headers: { "Authorization": `Bearer ${token}` } },
  );

  const result = await response.json();
  return { scores: result };
};

export default loader;
