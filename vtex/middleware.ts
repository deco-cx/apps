import { getCookies } from "std/http/cookie.ts";
import { PAGE_DIRTY_KEY } from "@deco/deco/blocks";
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

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const segment = getSegmentFromBag(ctx);
  const isCookies = getISCookiesFromBag(ctx);

  if (!isCookies || !segment) {
    const cookies = getCookies(req.headers);

    if (!isCookies) {
      setISCookiesBag(cookies, ctx);
    }

    if (!segment) {
      setSegmentBag(cookies, req, ctx);
    }
  }

  // Mark as dirty when the segment has fields that affect page content
  // (campaigns, non-default sales channel, price tables, region).
  // UTMs are excluded — they're marketing tracking and don't change content.
  if (!isCacheableSegment(ctx)) {
    ctx.bag.set(PAGE_DIRTY_KEY, true);
  }

  return ctx.next!();
};
