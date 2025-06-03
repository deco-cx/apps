import { AppContext } from "../mod.ts";
import { CheckUserBalanceResponse } from "../client.ts";

/**
 * @title Check Balance
 * @description Check your current API credit balance
 */
const loader = async (
  _props: Record<string, never>,
  _req: Request,
  ctx: AppContext,
): Promise<CheckUserBalanceResponse> => {
  const response = await ctx.api["GET /api/v1/balance"]({});

  const result = await response.json();
  return result;
};

export default loader;
