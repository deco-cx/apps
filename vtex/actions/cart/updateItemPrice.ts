import { fetchSafe } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Props {
  itemIndex: number;
  price: number;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#put-/api/checkout/pub/orderForm/-orderFormId-/items/-itemIndex-/price
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const {
    itemIndex,
    price,
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(ctx).api.checkout.pub.orderForm.orderFormId(orderFormId).items
      .index(itemIndex).price,
  );

  const response = await fetchSafe(
    url,
    {
      method: "PUT",
      body: JSON.stringify({ price }),
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
