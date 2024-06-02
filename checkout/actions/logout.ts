import type { AppContext } from "../mod.ts";
import { deleteCookie } from "std/http/cookie.ts";

export default function (
  _props: object,
  _req: Request,
  { response }: AppContext,
) {
  deleteCookie(response.headers, "customerAccessToken");
  deleteCookie(response.headers, "customerAccessTokenExpires");
}
