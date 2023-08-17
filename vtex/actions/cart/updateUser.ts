import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { proxySetCookie } from "apps/vtex/utils/cookies.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId-
 */
const action = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { orderFormId, cookie } = parseCookie(req.headers);

  const response = await fetchSafe(
    paths(ctx).api.checkout.changeToAnonymousUser.orderFormId(orderFormId),
    {
      headers: {
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
