import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm } from "../../utils/types.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId-
 */
const action = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcs } = ctx;
  const { orderFormId, cookie } = parseCookie(req.headers);

  const response = await vcs
    ["GET /api/checkout/changeToAnonymousUser/:orderFormId"]({
      orderFormId,
    }, {
      headers: {
        accept: "application/json",
        cookie,
      },
    });

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
