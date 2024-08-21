import { setCookie } from "std/http/cookie.ts";
import { proxySetCookie } from "../../../utils/cookie.ts";
import { getLinxBasketId } from "../../loaders/cart.ts";
import { AppContext } from "../../mod.ts";
import { toLinxHeaders } from "../../utils/headers.ts";

type Location = {
  href: string;
  origin: string;
  protocol: string;
  pathname: string;
  search: string;
  full: string;
};

export default async function redirect(
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<{ location: Location } | null> {
  const user = await ctx.invoke.linx.loaders.user();

  const { api } = ctx;
  const requestHost = new URL(req.url).hostname;

  const BasketID = getLinxBasketId(req.headers);

  const response = await api
    ["POST /web-api/v1/Shopping/Basket/CheckoutRedirect"]({}, {
      headers: toLinxHeaders(req.headers),
      body: {
        BasketID,
      },
      redirect: "manual",
    });

  if (response === null) {
    return null;
  }

  const location = response.headers.get("Location");

  if (!location) {
    return null;
  }

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  if (!user) {
    setCookie(ctx.response.headers, {
      name: "lcsid",
      value: "",
      expires: new Date(0),
      domain: requestHost ?? undefined,
      path: "/",
    });
  }

  const url = new URL(location);

  return {
    location: {
      href: url.href,
      origin: url.origin,
      protocol: url.protocol,
      pathname: url.pathname,
      search: url.search,
      full: location,
    },
  };
}
