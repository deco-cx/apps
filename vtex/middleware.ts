import { equal } from "std/testing/asserts.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  buildSegmentCookie,
  getSegmentFromCookie,
  setSegmentCookie,
  setSegmentInBag,
} from "./utils/segment.ts";

const SEGMENT_ONCE_KEY = Symbol("Set segment on context");

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  if (!ctx.bag.has(SEGMENT_ONCE_KEY)) {
    ctx.bag.set(SEGMENT_ONCE_KEY, true);

    const segmentFromCookie = getSegmentFromCookie(req);
    const segmentFromRequest = buildSegmentCookie(req);
    const segment = { ...segmentFromCookie, ...segmentFromRequest };
    setSegmentInBag(ctx, segment);
    if (!equal(segmentFromCookie, segment)) {
      setSegmentCookie(segment, ctx.response.headers);
    }
  }

  return ctx.next!();
};
