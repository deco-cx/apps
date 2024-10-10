import { equal } from "std/testing/asserts.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  buildSegmentCookie,
  getSegmentFromBag,
  getSegmentFromCookie,
  setSegmentCookie,
  setSegmentInBag,
  setStoreCC,
} from "./utils/segment.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const segment = getSegmentFromBag(ctx);
  const url = new URL(req.url);
  const cc = url.searchParams.get("cc");

  if (cc) {
    setStoreCC(cc, ctx.response.headers);
  }

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
