import { AppContext } from "../mod.ts";
import { CreateTransactionRequest, TransactionResponse } from "../client.ts";

export interface Props extends CreateTransactionRequest {
  // Props inherits all fields from CreateTransactionRequest
  // Can add additional action-specific properties here if needed
}

/**
 * @title Create Transaction
 * @description Authenticate and create a new transaction in ClearSale
 */
const action = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<TransactionResponse> => {
  // First, authenticate to get the token
  const authResult = await ctx.getToken();
  const token = authResult.token;

  // Then, create the transaction using the bearer token
  const response = await ctx.api["POST /v1/transaction"](
    {},
    {
      headers: { "Authorization": `Bearer ${token}` },
      body: props,
    },
  );

  const result = await response.json();

  const { id, createdAt } = result;

  return { id, createdAt };
};

export default action;
