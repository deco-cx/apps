import { AppMiddlewareContext } from "./mod.ts";
import {
  getSegmentCookie,
  setSegmentCookie,
  setSegmentInBag,
} from "./utils/segment.ts";

const ONCE = Symbol("once");

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  if (!ctx.bag.has(ONCE)) {
    ctx.bag.set(ONCE, true);

    const segment = getSegmentCookie(req);
    setSegmentInBag(ctx, segment);
    setSegmentCookie(segment, ctx.response.headers);
  }

  return ctx.next!();
};
