import { getCookies, setCookie } from "std/http/cookie.ts";
import { Cart } from "../../loaders/cart.ts";
import { parseCookieString } from "../../middleware.ts";
import type { AppContext } from "../../mod.ts";
import { getCartCookie, handleCartActions } from "../../utils/cart.ts";
import { FORM_KEY_COOKIE } from "../../utils/constants.ts";
import { HttpError } from "../../../utils/http.ts";
import { OverrideFeatures } from "../../utils/client/types.ts";

export interface Props extends OverrideFeatures {
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
  const { qty, productId, dangerouslyOverrideReturnNull, sku } = props;
  const { headers, url } = req;
  const { site, features, clientAdmin } = ctx;
  const dontReturnCart = dangerouslyOverrideReturnNull ??
    features.dangerouslyReturnNullAfterAction;

  const baseUrl = ctx.baseUrl.get() ?? "";

  const formKey = getCookies(headers)[FORM_KEY_COOKIE] ?? "";
  const cartId = getCartCookie(req.headers);

  const newHeaders = new Headers();

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

  if (cartId) {
    const body = {
      cartItem: {
        qty: qty,
        quote_id: cartId,
        sku: sku,
      },
    };
    const result = await clientAdmin["POST /rest/:site/V1/carts/:cartId/items"](
      {
        cartId: cartId,
        site: ctx.site,
      },
      { body },
    ).catch((e) => {
      console.error(e);
    });

    if(result?.ok) {
      return handleCartActions(dontReturnCart, {
        req,
        ctx,
      });
    }
  }

  try {
    const fetchResult = await fetch(
      `${baseUrl}/${site}/checkout/cart/add/uenc/${
        btoa(baseUrl).replace(/=/g, "~")
      }/product/${productId}`,
      {
        method: "POST",
        headers: newHeaders,
        body: urlencoded,
      },
    );

    if (fetchResult.status != 200) {
      throw new HttpError(
        fetchResult.status,
        JSON.stringify({ message: fetchResult.statusText }),
      );
    }
    const fetchHeaders = fetchResult.headers;

    let cartId;
    const cookies = fetchHeaders.getSetCookie();
    cookies.forEach((cookie) => {
      const parsed = parseCookieString(cookie, url.includes("localhost"));

      if (parsed.name === "dataservices_cart_id") {
        cartId = parsed.value.replace(/%22/g, "");
        setCookie(ctx.response.headers, {
          ...parsed,
          httpOnly: true,
          secure: true,
          path: "/",
          unparsed: ["Priority=High"],
        });
        return;
      }

      setCookie(ctx.response.headers, {
        ...parsed,
        path: "/",
      });
    });

    return handleCartActions(dontReturnCart, {
      req,
      ctx,
      cartId,
    });
  } catch (error) {
    console.error(error);
    return handleCartActions(dontReturnCart, {
      req,
      ctx,
      error,
    });
  }
};

export default action;
