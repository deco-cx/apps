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
}

export default async function redirect(
  _props: unknown, 
  req: Request, 
  ctx: AppContext
): Promise<{ location: Location } | null> {
  const { api } = ctx;

  const BasketID = getLinxBasketId(req.headers);

  const response = await api["POST /web-api/v1/Shopping/Basket/CheckoutRedirect"]({}, {
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
  // setCookie(ctx.response.headers, {
  //   name: "lcsid",
  //   value: "",
  //   expires: new Date(0),
  //   domain: req.headers.get("host") ?? undefined,
  // });

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
};