import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import { parseCookie } from "../utils/orderForm.ts";
import type { OrderForm } from "../utils/types.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers);

  const response = await vcsDeprecated["POST /api/checkout/pub/orderForm"]({}, {
    headers: { cookie },
  });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default loader;
