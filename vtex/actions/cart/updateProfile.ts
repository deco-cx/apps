import { fetchSafe } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Props {
  ignoreProfileData: boolean;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#patch-/api/checkout/pub/orderForm/-orderFormId-/profile
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { ignoreProfileData } = props;
  const { orderFormId, cookie } = parseCookie(req.headers);
  const url = new URL(
    paths(ctx).api.checkout.pub.orderForm
      .orderFormId(orderFormId)
      .profile,
  );

  const response = await fetchSafe(
    url,
    {
      method: "PATCH",
      body: JSON.stringify({ ignoreProfileData }),
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
