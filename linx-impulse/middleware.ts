import { getCookies, setCookie } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import { getDeviceIdFromBag, setDeviceIdInBag } from "./utils/deviceId.ts";
import { DEVICE_ID_COOKIE_NAME } from "./utils/constants.ts";

const log = (...args: unknown[]) => console.log("[middleware]", ...args);

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  const deviceId = getDeviceIdFromBag(ctx);

  log("deviceId", deviceId);

  if (!deviceId) {
    log("setting deviceId");

    const cookies = getCookies(req.headers);
    let cookie = cookies[DEVICE_ID_COOKIE_NAME];

    log("cookie", cookie);

    if (!cookie) {
      log("generating new deviceId");

      cookie = crypto.randomUUID();

      log("new deviceId", cookie);

      setCookie(ctx.response.headers, {
        value: cookie,
        name: DEVICE_ID_COOKIE_NAME,
        path: "/",
        secure: true,
        httpOnly: true,
      });
    }

    log(cookie);
    log("setting deviceId in bag");

    setDeviceIdInBag(ctx, cookie);
  }

  return ctx.next!();
};
