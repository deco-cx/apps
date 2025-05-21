import { getCookies } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  getISCookiesFromBag,
  setISCookiesBag,
} from "./utils/intelligentSearch.ts";
import { getSegmentFromBag, setSegmentBag } from "./utils/segment.ts";
import {
  resolveSkipSimulationBehavior,
  setSkipSimulationBehaviorToBag,
} from "./utils/simulationBehavior.ts";

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const segment = getSegmentFromBag(ctx);
  const isCookies = getISCookiesFromBag(ctx);
  const skipSimulationBehavior = await resolveSkipSimulationBehavior(ctx, req);
  setSkipSimulationBehaviorToBag(ctx, skipSimulationBehavior);

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
