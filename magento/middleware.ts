// import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
// import { SESSION_COOKIE } from "./utils/constants.ts";
// import { generateUniqueIdentifier } from "./utils/hash.ts";
// import { CART_COOKIE, getCartCookie } from "./utils/cart.ts";

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
  cookieAttributes.name = name?.trim();
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

export const middleware = (
  _props: unknown,
  _req: Request,
  ctx: AppMiddlewareContext,
) => {
  // const {
  //   next,
  //   baseUrl,
  //   clientAdmin,
  //   site,
  //   cartConfigs: { changeCardIdAfterCheckout },
  // } = ctx;
  // const sessionCookie = getCookies(req.headers)[SESSION_COOKIE];
  // const cartId = getCartCookie(req.headers);

  // if (cartId.length && sessionCookie && changeCardIdAfterCheckout) {
  //   const sectionCart = await clientAdmin["GET /:site/customer/section/load"]({
  //     site,
  //     sections: "cart,carbono-customer",
  //   }, {
  //     headers: {
  //       "Cookie": req.headers.get("Cookie") ?? "",
  //     },
  //   }).then((res) => res.json());

  //   if (
  //     !sectionCart?.cart?.minicart_improvements?.quote_id ||
  //     Number.isNaN(Number(sectionCart?.cart?.minicart_improvements?.quote_id))
  //   ) {
  //     return next!();
  //   }

  //   const quoteId = sectionCart?.cart?.minicart_improvements.quote_id;
  //   if (quoteId !== cartId) {
  //     setCookie(ctx.response.headers, {
  //       name: CART_COOKIE,
  //       value: `%22${quoteId}%22`,
  //       path: "/",
  //       unparsed: ["Priority=High"],
  //       expires: undefined,
  //       domain: new URL(req.url).hostname.replace(/deco|www/, ""),
  //     });
  //   }
  // }

  // if (sessionCookie) {
  //   return next!();
  // }

  // const request = await fetch(
  //   `${baseUrl}/customer/section/load/?sections=customer`,
  //   {
  //     headers: {
  //       Cookie: req.headers.get("Cookie") ?? "",
  //     },
  //   },
  // );

  // const cookies = request.headers.getSetCookie();
  // if (cookies && !ctx.response.headers.getSetCookie().length) {
  //   cookies.forEach((cookie, index) => {
  //     setCookie(ctx.response.headers, {
  //       ...parseCookieString(cookie, req.url.includes("localhost")),
  //       path: "/",
  //       unparsed: ["Priority=High"],
  //     });

  //     if (index === 0) {
  //       setCookie(ctx.response.headers, {
  //         ...parseCookieString(cookie, req.url.includes("localhost")),
  //         path: "/",
  //         name: "form_key",
  //         expires: undefined,
  //         unparsed: ["Priority=High"],
  //         value: generateUniqueIdentifier().replace(/=/g, ""),
  //       });
  //     }
  //   });
  // }

  return ctx.next!();
};
