import { AppMiddlewareContext } from "./mod.ts";
import {
  checkDurationOrDayChange,
  getSegmentFromCookie,
  setSegmentCookie,
  generateUniqueIdentifier,
  getSegmentFromBag,
  setSegmentInBag
} from "./utils/segment.ts";

export const middleware = async (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
    const segment = getSegmentFromBag(ctx);
    if (!segment && ctx.isServeSide) {
    const anonymous_cookie = getSegmentFromCookie(
        "smarthint_anonymous_consumer",
        req
      );
      if (!anonymous_cookie) {
        const { hash } = await generateUniqueIdentifier();
        setSegmentCookie(hash, "smarthint_anonymous_consumer", ctx.response.headers);
      }
      const session_cookie = getSegmentFromCookie("smarthint_session", req);
      const session_timestamp = getSegmentFromCookie("smarthint_timestamp", req);
      if (
        !session_cookie || !session_timestamp ||
        checkDurationOrDayChange(session_timestamp)
      ) {
        const { hash, timestamp } = await generateUniqueIdentifier();
        setSegmentCookie(hash, "smarthint_session", ctx.response.headers);
        setSegmentCookie(timestamp.toString(), "smarthint_timestamp", ctx.response.headers);
      }
      if (anonymous_cookie && session_cookie && session_timestamp) {
          setSegmentInBag(ctx, {anonymous_cookie, session_cookie, session_timestamp});
      }
    }
      return ctx.next!();
    };
