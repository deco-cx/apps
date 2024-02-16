import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";
import type { OrderForm } from "../../utils/types.ts";
import { forceHttpsOnAssets } from "../../utils/transform.ts";

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
  const { vcsDeprecated } = ctx;
  const {
    orderItems,
    allowedOutdatedData = ["paymentData"],
  } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";
  const segment = getSegmentFromBag(ctx);

  try {
    const response = await vcsDeprecated
      ["POST /api/checkout/pub/orderForm/:orderFormId/items"]({
        orderFormId,
        allowedOutdatedData,
        sc: segment?.payload.channel,
      }, {
        body: { orderItems },
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          cookie,
        },
      });

    proxySetCookie(response.headers, ctx.response.headers, req.url);

    return forceHttpsOnAssets((await response.json()) as OrderForm);
  } catch (error) {
    console.error(error);

    throw error;
  }
};

export default action;
