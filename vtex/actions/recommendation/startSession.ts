import { getSetCookies } from "std/http/cookie.ts";
import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";

export default async function action(
  _: unknown,
  req: Request,
  ctx: AppContext,
) {
  const { bff } = ctx;
  const { orderFormId } = parseCookie(req.headers);

  const url = new URL(req.url);
  const host = url.host;

  const headers = new Headers();
  headers.set(
    "x-vtex-rec-origin",
    `${ctx.account}/storefront/deco.recommendations@1.x`,
  );
  headers.set("x-forwarded-host", host);
  headers.set("host", `${ctx.account}.vtexcommercestable.com.br`);

  const cookie = req.headers.get("cookie");
  if (cookie) {
    headers.set("cookie", cookie);
  }

  const response = await bff["POST /api/recommend-bff/v2/users/start-session"]({
    an: ctx.account,
  }, {
    body: { orderFormId },
    headers,
  });

  const data = await response.json();

  console.log(data, getSetCookies(response.headers));
  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return data;
}
