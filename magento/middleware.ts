import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import { SESSION_COOKIE } from "./utils/constants.ts";
import { generateUniqueIdentifier } from "./utils/hash.ts";

export interface Cookie {
  name: string;
  value: string;
  domain?: string;
  expires?: number;
  secure?: boolean;
  httpOnly?: boolean;
}

function parseCookieString(cookieString: string) {
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
      cookieAttributes.domain = attributeValue as string;
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
}

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const ctxMiddleware = ctx;
  const sessionCookie = getCookies(req.headers)[SESSION_COOKIE];
  if (sessionCookie) {
    return ctxMiddleware.next!();
  }
  const request = await fetch(`${ctxMiddleware.baseUrl}/V1`);
  const cookies = request.headers.getSetCookie();
  if (cookies) {
    cookies.forEach((cookie, index) => {
      setCookie(ctx.response.headers, {
        ...parseCookieString(cookie),
        path: "/",
      });

      if (index === 0) {
        setCookie(ctx.response.headers, {
          ...parseCookieString(cookie),
          path: "/",
          name: "form_key",
          value: generateUniqueIdentifier().replace(/=/g, ""),
        });
      }
    });
  }

  return ctxMiddleware.next!();
};
