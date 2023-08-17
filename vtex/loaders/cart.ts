import { fetchSafe } from "apps/utils/fetch.ts";
import { AppContext } from "apps/vtex/mod.ts";
import { proxySetCookie } from "apps/vtex/utils/cookies.ts";
import { parseCookie } from "apps/vtex/utils/orderForm.ts";
import { paths } from "apps/vtex/utils/paths.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { cookie } = parseCookie(req.headers);

  const response = await fetchSafe(
    `${paths(ctx).api.checkout.pub.orderForm}`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default loader;
