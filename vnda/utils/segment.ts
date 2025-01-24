import { getCookies, setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";

interface Segment {
  agent: string;
}

export const STORE_CC_COOKIE_NAME = "store_cc";
export const CART_CC_COOKIE_NAME = "cart_cc";
export const SEGMENT_COOKIE_NAME = "vnda_segment";
const SEGMENT = Symbol("segment");
const SIXTYDAYS = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

export const getSegmentFromBag = (ctx: AppContext): string =>
  ctx.bag?.get(SEGMENT);
export const setSegmentInBag = (ctx: AppContext, segment: string) =>
  ctx.bag?.set(SEGMENT, segment);

export const parse = (cookie: string) => JSON.parse(atob(cookie));

export const buildSegmentCookie = (req: Request): string | null => {
  const url = new URL(req.url);
  const param = url.searchParams.get("agent");

  return param || null;
};

export const getSegmentFromCookie = (
  req: Request,
): string | undefined => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[SEGMENT_COOKIE_NAME];
  return cookie;
};

export const setSegmentCookie = (
  segment: string,
  headers: Headers = new Headers(),
): Headers => {
  setCookie(headers, {
    value: segment,
    name: SEGMENT_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
    expires: SIXTYDAYS,
  });

  return headers;
};

export const getCC = (
  req: Request,
): string | undefined => {
  const cookies = getCookies(req.headers);
  const cookie = cookies[STORE_CC_COOKIE_NAME];
  return cookie;
};

export const setStoreCC = (
  cc: string,
  headers: Headers = new Headers(),
): Headers => {
  setCookie(headers, {
    value: cc,
    name: STORE_CC_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
  });
  setCookie(headers, {
    value: cc,
    name: CART_CC_COOKIE_NAME,
    path: "/",
    secure: true,
    httpOnly: true,
  });

  return headers;
};
