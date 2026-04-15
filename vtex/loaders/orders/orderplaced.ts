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
 * Checkout cookies (CheckoutDataAccess + Vtex_CHKO_Auth) are set by VTEX right
 * after an order is placed and are sufficient — and preferred — to access the
 * order-placed page. The VtexIdclientAutCookie_* auth cookie can still be
 * present in the browser even after it has expired, so sending it alongside the
 * checkout cookies (or on its own when stale) causes the request to fail.
 * Strategy: use checkout cookies when available; fall back to the auth cookie
 * only when they are absent.
 */
function resolveOrderCookie(headers: Headers): string {
  const all = getCookies(headers);

  const checkoutCookies = Object.fromEntries(
    Object.entries(all).filter(([key]) =>
      key === CHECKOUT_DATA_ACCESS_COOKIE || key === VTEX_CHKO_AUTH
    ),
  );

  if (Object.keys(checkoutCookies).length > 0) {
    return stringify(checkoutCookies);
  }

  const authCookies = Object.fromEntries(
    Object.entries(all).filter(([key]) =>
      key.startsWith(VTEX_ID_CLIENT_COOKIE)
    ),
  );

  return stringify(authCookies);
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
  const cookie = resolveOrderCookie(req.headers);

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
