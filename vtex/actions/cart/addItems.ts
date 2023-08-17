import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { proxySetCookie } from "apps/vtex/utils/cookies.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";

export interface Item {
  quantity: number;
  seller: string;
  id: string;
  index?: number;
  price?: number;
}

export interface Props {
  orderItems: Item[];
  allowedOutdatedData?: Array<"paymentData">;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#post-/api/checkout/pub/orderForm/-orderFormId-/items
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    `${
      paths(ctx).api.checkout.pub.orderForm
        .orderFormId(orderFormId)
        .items
    }`,
  );

  if (allowedOutdatedData) {
    for (const it of allowedOutdatedData) {
      url.searchParams.append("allowedOutdatedData", it);
    }
  }

  const response = await fetchSafe(
    url,
    {
      method: "POST",
      body: JSON.stringify({ orderItems }),
      headers: {
        "content-type": "application/json",
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
