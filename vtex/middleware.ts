import { AppMiddlewareContext } from "./mod.ts";
import {
  getSegmentCookie,
  setSegment,
  setSegmentCookie,
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
    setSegment(ctx, segment);
    setSegmentCookie(segment, ctx.response.headers);
  }

  return ctx.next!();
};
