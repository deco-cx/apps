import { getCookies, setCookie } from "std/http/mod.ts";
import { AppContext } from "../mod.ts";
import { DEVICE_ID_COOKIE_NAME } from "./constants.ts";

export default function getDeviceId(req: Request, ctx: AppContext) {
  const cookies = getCookies(req.headers);
  let cookie = cookies[DEVICE_ID_COOKIE_NAME];

  if (!cookie) {
    cookie = crypto.randomUUID();
    setCookie(ctx.response.headers, {
      value: cookie,
      name: DEVICE_ID_COOKIE_NAME,
      path: "/",
      secure: true,
      httpOnly: true,
    });
  }

  return cookie;
}
