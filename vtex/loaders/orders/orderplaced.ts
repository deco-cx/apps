import { getCookies } from "@std/http";
import { AppContext } from "../../mod.ts";
import {
  CHECKOUT_DATA_ACCESS_COOKIE,
  stringify,
  VTEX_CHKO_AUTH,
} from "../../utils/cookies.ts";
import { VTEX_ID_CLIENT_COOKIE } from "../../utils/vtexId.ts";

interface Props {
  orderId: string;
}

/**
 * @title Get Order Placed Order Details
 * @description Should be used on order placed page, the user must be authenticated or have access to the order through permissions or cookies
 */
export default async function loader(
  { orderId }: Props,
  req: Request,
  ctx: AppContext,
) {
  const { vcsDeprecated } = ctx;
  const cookies = Object.fromEntries(
    Object.entries(getCookies(req.headers)).filter(([key]) =>
      key.startsWith(VTEX_ID_CLIENT_COOKIE) ||
      // these two cookies are set by VTEX after order is placed on checkout and are
      // used to access the order placed page
      key === CHECKOUT_DATA_ACCESS_COOKIE ||
      key === VTEX_CHKO_AUTH
    ),
  );
  const cookie = stringify(cookies);

  const isOrderGroup = !orderId.includes("-");

  if (isOrderGroup) {
    const orderGroup = await vcsDeprecated
      ["GET /api/checkout/pub/orders/order-group/:orderGroupId"]({
        orderGroupId: orderId,
      }, {
        headers: { cookie },
      }).then((res) => res.json());

    return orderGroup;
  }

  const order = await vcsDeprecated["GET /api/checkout/pub/orders/:orderId"]({
    orderId,
  }, {
    headers: { cookie },
  }).then((res) => res.json());

  return [order];
}
