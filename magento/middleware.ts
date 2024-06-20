import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import { SESSION_COOKIE } from "./utils/constants.ts";
import { generateUniqueIdentifier } from "./utils/hash.ts";
import { getCartCookie, setCartCookie } from "./utils/cart.ts";

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
}

export const parseCookieString = (cookieString: string, isLocal: boolean) => {
  const parts = cookieString.split(";").map((part) => part.trim());
  const cookieAttributes: Cookie = { name: "", value: "" };

  const [name, value] = parts[0].split("=");
  cookieAttributes.name = name.trim();
  cookieAttributes.value = value ? value : "";

  for (let i = 1; i < parts.length; i++) {
    const attribute = parts[i];
    const [key, val] = attribute.split("=");
    const attributeKey = key.trim().toLowerCase();
    const attributeValue = val ? decodeURIComponent(val.trim()) : true;
    if (attributeKey === "domain") {
      cookieAttributes.domain = isLocal
        ? "localhost"
        : attributeValue as string;
    }
    if (attributeKey === "expires") {
      cookieAttributes.expires = Date.parse(attributeValue as string);
    } else if (attributeKey === "secure") {
      cookieAttributes.secure = true;
    } else if (attributeKey === "httponly") {
      cookieAttributes.httpOnly = true;
    }
  }

  return cookieAttributes;
};

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const {next, baseUrl, clientAdmin, site, cartConfigs: {changeCardIdAfterCheckout} } = ctx;
  const sessionCookie = getCookies(req.headers)[SESSION_COOKIE];
  const cartId = getCartCookie(req.headers)

  if (cartId.length, sessionCookie, changeCardIdAfterCheckout) {
    const sectionCart = await clientAdmin["GET /:site/customer/section/load"]({
      site,
      sections: "cart"
    }, { headers: new Headers({ Cookie: `${SESSION_COOKIE}=${sessionCookie}` }) }).then((res) => res.json())
    const quoteId = sectionCart?.cart?.minicart_improvements?.quote_id
    if(!quoteId) return
   if(quoteId !== cartId){
    setCartCookie(ctx.response.headers, quoteId)
  }
  }

  if (sessionCookie) {
    return next!();
  }
  const request = await fetch(`${baseUrl}/V1`);
  const cookies = request.headers.getSetCookie();
  if (cookies) {
    cookies.forEach((cookie, index) => {
      setCookie(ctx.response.headers, {
        ...parseCookieString(cookie, req.url.includes("localhost")),
        path: "/",
      });

      if (index === 0) {
        setCookie(ctx.response.headers, {
          ...parseCookieString(cookie, req.url.includes("localhost")),
          path: "/",
          name: "form_key",
          expires: undefined,
          value: generateUniqueIdentifier().replace(/=/g, ""),
        });
      }
    });
  }

  return next!();
};
