import { AppContext } from "../mod.ts";
import { Score } from "../client.ts";

export interface Props {
  /**
   * @title Transaction ID
   * @description The ID of the transaction to generate fraud scores for
   */
  transactionId: string;
}

/**
 * @title Create Fraud Score
 * @description Generate fraud scores for a specific transaction in ClearSale
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<{ scores: Score[] }> => {
  const { transactionId } = props;

  // First, authenticate to get the token
  const authResult = await ctx.getToken();
  const token = authResult.token;

  // Then, create the fraud scores using the bearer token
  const response = await ctx.api["POST /v1/transaction/:transactionId/scores"](
    { transactionId },
    { headers: { "Authorization": `Bearer ${token}` } },
  );

  const result = await response.json();
  return { scores: result };
};

export default action;
