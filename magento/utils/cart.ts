import { getCookies } from "std/http/cookie.ts";
import { AppContext } from "../mod.ts";

const CART_COOKIE = "dataservices_cart_id";
const CART_CUSTOMER_COOKIE = "dataservices_customer_id";

const ONE_WEEK_MS = 7 * 24 * 3600 * 1_000;

export const getCartCookie = (headers: Headers): string => {
  const cookies = getCookies(headers);

  return `${cookies[CART_COOKIE]}`;
};

export const setCartCookie = (headers: Headers, cartId: string) => {
  const encodedCartId = encodeURIComponent(`"${decodeURIComponent(cartId)}"`);
  const cookie = `${CART_COOKIE}=${encodedCartId}; Path=/; Expires=${
    new Date(Date.now() + ONE_WEEK_MS).toUTCString()
  }; SameSite=Lax`;
  headers.append("Set-Cookie", cookie);
};

export async function createCart(
  { clientAdmin, site }: AppContext,
  headers: Headers,
) {
  const customerCookie = getCookies(headers)[CART_CUSTOMER_COOKIE];
  const cartCookie = getCookies(headers)[CART_COOKIE];

  if (customerCookie && cartCookie) {
    return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
      cartId: cartCookie,
      site,
    }).then((res) => res.json());
  }

  const tokenCart = await clientAdmin["POST /rest/:site/V1/guest-carts"]({
    site,
  }).then((res) => res.json());

  const cart = await clientAdmin["GET /rest/:site/V1/guest-carts/:cartId"]({
    cartId: tokenCart,
    site,
  }).then((res) => res.json());

  return await clientAdmin["GET /rest/:site/V1/carts/:cartId"]({
    cartId: cart.id,
    site,
  }).then((res) => res.json());
}
