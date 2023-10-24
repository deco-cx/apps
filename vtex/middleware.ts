import { equal } from "std/testing/asserts.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  buildSegmentCookie,
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

// Symbols are the default keys for WeakMaps https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
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
    const segment = {
      ...DEFAULT_SEGMENT,
      ...segmentFromCookie,
      ...segmentFromRequest,
    };
    setSegmentInBag(ctx, segment);
    if (!equal(segmentFromCookie, segment)) {
      setSegmentCookie(segment, ctx.response.headers);
    }
  }

  return ctx.next!();
};
