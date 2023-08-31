import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Item {
  quantity: number;
  index: number;
}

export interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items/update
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcs } = ctx;
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);

  const response = await vcs
    ["POST /api/checkout/pub/orderForm/:orderFormId/items/update"]({
      orderFormId,
      allowedOutdatedData,
    }, {
      body: { orderItems },
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
