import type { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie as parseOrderformCookie } from "../../utils/orderForm.ts";
import { parseCookie as parseRecommendationsCookie } from "../../utils/recommendations.ts";

export default async function action(
  _: unknown,
  req: Request,
  ctx: AppContext,
) {
  const { bff } = ctx;
  const { orderFormId } = parseOrderformCookie(req.headers);
  const { userId } = parseRecommendationsCookie(req.headers);
  if (userId) {
    return { recommendationsUserId: userId };
  }

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

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return data;
}
