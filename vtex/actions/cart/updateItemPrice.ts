import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
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
  const { vcsDeprecated } = ctx;
  const {
    itemIndex,
    price,
  } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";

  const response = await vcsDeprecated
    ["PUT /api/checkout/pub/orderForm/:orderFormId/items/:index/price"]({
      orderFormId,
      index: itemIndex,
    }, {
      body: { price },
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        cookie,
      },
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
