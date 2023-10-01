import { AppMiddlewareContext } from "./mod.ts";
import { getSegment, SEGMENT, setSegment } from "./utils/segment.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  if (!ctx.bag.has(SEGMENT)) {
    const segment = getSegment(req);
    ctx.bag.set(SEGMENT, segment);
    setSegment(segment, ctx.response.headers);
  }

  return ctx.next!();
};
