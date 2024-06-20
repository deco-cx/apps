import { getCookies, setCookie } from "std/http/cookie.ts";
import cart, { Cart } from "../../loaders/cart.ts";
import { parseCookieString } from "../../middleware.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartError } from "../../utils/cart.ts";
import { FORM_KEY_COOKIE } from "../../utils/constants.ts";
import addItem_old from "./addItemToCart.ts";

export interface Props {
  qty: number;
  sku: string;
  productId: string;
}

/**
 * @title Magento Integration - Add item to cart
 * @description Add item action
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Cart | null> => {
  const { qty, productId } = props;
  const { headers, url } = req;
  const { site, baseUrl } = ctx;
  const formKey = getCookies(headers)[FORM_KEY_COOKIE] ?? "";
  const cartId = getCartCookie(headers);
  const newHeaders = new Headers();

  if (cartId?.length) {
    return await addItem_old(props, req, ctx);
  }
  console.log("adicionando item no carinho pela action nova")

  const requestCookies = headers.get("Cookie");

  if (requestCookies) {
    newHeaders.append("Cookie", requestCookies);
  }
  newHeaders.append("Origin", baseUrl);
  newHeaders.append("Referer", url);
  newHeaders.append("X-Requested-With", "XMLHttpRequest");
  newHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("product", productId);
  urlencoded.append("form_key", formKey);
  urlencoded.append("qty", String(qty));

  try {
    const { headers: fetchHeaders } = await fetch(
      `${baseUrl}/${site}/checkout/cart/add/uenc/${
        btoa(url).replace(/=/g, "~")
      }/product/${productId}`,
      {
        method: "POST",
        headers: newHeaders,
        body: urlencoded,
      },
    );

    let cartId;
    const cookies = fetchHeaders.getSetCookie();
    cookies.forEach((cookie) => {
      const parsed = parseCookieString(cookie, url.includes("localhost"));

      if (parsed.name === "dataservices_cart_id") {
        cartId = parsed.value.replace(/%22/g, "");
      }

      setCookie(ctx.response.headers, {
        ...parsed,
        path: "/",
      });
    });

    return await cart({ cartId }, req, ctx);
  } catch (error) {
    console.error(error);
    return {
      ...(await cart(undefined, req, ctx)),
      ...handleCartError(error),
    };
  }
};

export default action;
