import { getCookies } from "std/http/cookie.ts";
import { PAGE_CACHE_ALLOWED_KEY } from "@deco/deco/blocks";
import { AppMiddlewareContext } from "./mod.ts";
import {
  getISCookiesFromBag,
  setISCookiesBag,
} from "./utils/intelligentSearch.ts";
import {
  getSegmentFromBag,
  hasUTM,
  isCacheableSegment,
  setSegmentBag,
} from "./utils/segment.ts";
import { VTEX_ID_CLIENT_COOKIE } from "./utils/vtexId.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const segment = getSegmentFromBag(ctx);
  const isCookies = getISCookiesFromBag(ctx);
  const cookies = getCookies(req.headers);

  if (!isCookies) {
    setISCookiesBag(cookies, ctx);
  }

  if (!segment) {
    setSegmentBag(cookies, req, ctx);
  }

  const isLoggedIn = Boolean(
    cookies[VTEX_ID_CLIENT_COOKIE] ||
      cookies[`${VTEX_ID_CLIENT_COOKIE}_${ctx.account}`],
  );

  // UTM can drive VTEX promotions and change price, so a UTM-carrying request
  // is only cacheable when the store opts into removeUTMFromCacheKey (the same
  // flag the product loaders use to strip UTM from their cache key). Channel is
  // left cacheable (CDN varies by VTEXSC), matching isCacheableSegment.
  const utmBlocksCache = !ctx.advancedConfigs?.removeUTMFromCacheKey &&
    hasUTM(ctx);
  const cacheable = isCacheableSegment(ctx) && !utmBlocksCache && !isLoggedIn;

  if (cacheable) {
    ctx.bag.set(PAGE_CACHE_ALLOWED_KEY, true);
  } else {
    ctx.response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
  }

  return ctx.next!();
};
