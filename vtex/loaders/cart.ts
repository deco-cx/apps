import { fetchSafe } from "../../utils/fetch.ts";
import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import { parseCookie } from "../utils/orderForm.ts";
import { paths } from "../utils/paths.ts";
import type { OrderForm } from "../utils/types.ts";

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
