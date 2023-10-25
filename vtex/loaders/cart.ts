import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import { parseCookie } from "../utils/orderForm.ts";
import { getSegmentFromBag } from "../utils/segment.ts";
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
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated["POST /api/checkout/pub/orderForm"](
    { sc: segment?.channel },
    { headers: { cookie } },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default loader;
