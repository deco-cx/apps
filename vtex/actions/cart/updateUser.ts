import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm } from "../../utils/types.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";

export interface Props {
  sc?: string;
}

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/checkout/changeToAnonymousUser/-orderFormId-
 * @title Update User
 * @description Update the user
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const { sc } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated[
    "GET /api/checkout/changeToAnonymousUser/:orderFormId"
  ](
    {
      orderFormId,
      sc:
        (sc ?? ctx.allowMixedSegments)
          ? segment?.payload.channel
          : ctx.salesChannel,
    },
    {
      headers: {
        accept: "application/json",
        cookie,
      },
    },
  );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
