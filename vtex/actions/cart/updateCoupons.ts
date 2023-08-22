import { fetchSafe } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Props {
  text: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/coupons
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { text } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(ctx).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .coupons,
  );

  const response = await fetchSafe(
    url,
    {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
