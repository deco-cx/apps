import { AppMiddlewareContext } from "./mod.ts";
import { equal } from "std/testing/asserts.ts";
import {
  buildSegmentCookie,
  getSegmentFromBag,
  getSegmentFromCookie,
  setSegmentCookie,
  setSegmentInBag,
} from "./utils/segment.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const segment = getSegmentFromBag(ctx);
  if (!segment) {
    const segmentFromRequest = buildSegmentCookie(req);
    const segmentFromCookie = getSegmentFromCookie(req);
    if (
      segmentFromRequest !== null &&
      !equal(segmentFromRequest, segmentFromCookie)
    ) {
      setSegmentInBag(ctx, segmentFromRequest);
      setSegmentCookie(segmentFromRequest, ctx.response.headers);
    }
  }
  return ctx.next!();
};
