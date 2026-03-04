import { getCookies } from "std/http/cookie.ts";
import { PAGE_CACHE_ALLOWED_KEY, PAGE_DIRTY_KEY } from "@deco/deco/blocks";
import { AppMiddlewareContext } from "./mod.ts";
import {
  getISCookiesFromBag,
  setISCookiesBag,
} from "./utils/intelligentSearch.ts";
import {
  getSegmentFromBag,
  isCacheableSegment,
  setSegmentBag,
} from "./utils/segment.ts";
import { VTEX_ID_CLIENT_COOKIE } from "./utils/vtexId.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  // Sanitize numeric query params early — invalid values (e.g. SSRF URLs
  // passed as ?page=) cause NaN errors downstream in PLP loaders.
  const url = new URL(req.url);
  let dirty = false;

  const page = url.searchParams.get("page");
  if (page !== null) {
    const num = Number(page);
    if (!Number.isInteger(num) || num < 1) {
      url.searchParams.delete("page");
      dirty = true;
    }
  }

  const ps = url.searchParams.get("PS");
  if (ps !== null) {
    const num = Number(ps);
    if (!Number.isInteger(num) || num < 1 || num > 50) {
      url.searchParams.delete("PS");
      dirty = true;
    }
  }

  if (dirty) {
    return Promise.resolve(new Response(null, {
      status: 301,
      headers: { Location: url.pathname + url.search },
    }));
  }

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

  const cacheable = isCacheableSegment(ctx) && !isLoggedIn;

  // PAGE_DIRTY_KEY: marks page dirty for section-level caching and other consumers
  if (!cacheable) {
    ctx.bag.set(PAGE_DIRTY_KEY, true);
    ctx.response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
  }

  // PAGE_CACHE_ALLOWED_KEY: opts in to CDN page caching (VTEX-only)
  if (cacheable) {
    ctx.bag.set(PAGE_CACHE_ALLOWED_KEY, true);
  }

  return ctx.next!();
};
