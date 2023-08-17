import { parseCookie } from "../../utils/orderForm.ts";
import { paths } from "../../utils/paths.ts";
import { fetchSafe } from "apps/utils/fetch.ts";
import { proxySetCookie } from "apps/vtex/utils/cookies.ts";
import { AppContext } from "apps/vtex/mod.ts";
import type { OrderForm } from "apps/vtex/utils/types.ts";

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
