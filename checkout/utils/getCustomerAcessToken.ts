import { getCookies } from "std/http/cookie.ts";

export default function (req: Request) {
  return getCookies(req.headers).customerAccessToken;
}
