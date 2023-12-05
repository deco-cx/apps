import { getCookies } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  getISCookiesFromBag,
  setISCookiesBag,
} from "./utils/intelligentSearch.ts";
import { getSegmentFromBag, setSegmentBag } from "./utils/segment.ts";

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

  return ctx.next!();
};
