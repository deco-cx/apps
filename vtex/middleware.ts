import { equal } from "std/testing/asserts.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  buildSegmentCookie,
  getSegmentFromBag,
  getSegmentFromCookie,
  setSegmentCookie,
  setSegmentInBag,
} from "./utils/segment.ts";
import { Segment } from "./utils/types.ts";

/**
 * by default segment starts with null values
 */
const DEFAULT_SEGMENT: Partial<Segment> = {
  utmi_campaign: null,
  utm_campaign: null,
  utm_source: null,
};

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const { salesChannel, response } = ctx;
  const segment = getSegmentFromBag(ctx);

  if (!segment) {
    const segmentFromCookie = getSegmentFromCookie(req);
    const segmentFromRequest = buildSegmentCookie(req);

    const segment = {
      channel: salesChannel,
      ...DEFAULT_SEGMENT,
      ...ctx.defaultSegment,
      ...segmentFromCookie,
      ...segmentFromRequest,
    };
    setSegmentInBag(ctx, segment);

    // Avoid setting cookie when segment from request matches the one generated
    if (!equal(segmentFromCookie, segment)) {
      setSegmentCookie(segment, response.headers);
    }
  }

  return ctx.next!();
};
