import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm } from "../../utils/types.ts";

export interface Props {
  appId: string;
  // deno-lint-ignore no-explicit-any
  body: any;
}

/**
 * @title Update Custom Data
 * @description Update the custom data in the cart
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const {
    appId,
    body,
  } = props;
  const { orderFormId } = parseCookie(req.headers);

  if (!orderFormId || orderFormId === "") {
    throw new Error("Order form ID is required");
  }

  const cookie = req.headers.get("cookie") ?? "";

  const response = await vcsDeprecated
    ["PUT /api/checkout/pub/orderForm/:orderFormId/customData/:appId"]({
      orderFormId,
      appId,
    }, {
      body,
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
