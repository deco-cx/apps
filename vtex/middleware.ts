import { getCookies } from "std/http/cookie.ts";
import { AppMiddlewareContext } from "./mod.ts";
import {
  getISCookiesFromBag,
  setISCookiesBag,
} from "./utils/intelligentSearch.ts";
import { getSegmentFromBag, parse, setSegmentBag } from "./utils/segment.ts";
// import { parseCookie } from "./utils/vtexId.ts";

export const middleware = (
  _props: unknown,
  req: Request,
  ctx: AppMiddlewareContext,
) => {
  // console.log("middleware req", req.url);
  const segment = getSegmentFromBag(ctx);
  const isCookies = getISCookiesFromBag(ctx);
  const cookies = getCookies(req.headers);
  // const { payload } = parseCookie(req.headers, ctx.account);
  const segmentFromCookie = cookies.vtex_segment
    ? parse(cookies.vtex_segment)
    : null;
  // console.log("middleware isCookies", isCookies);
  console.log(
    `middleware segment no storegBag do ctx existe nesse momento %c${!!segment}`,
    "color:rgb(84, 255, 27);",
  );
  console.log(
    `middleware segmentFromCookie priceTables %c${segmentFromCookie?.priceTables}`,
    "color:rgb(84, 255, 27);",
  );

  // const { payload: userPayload } = parseCookie(req.headers, ctx.account);

  // const isAuthenticated = !!userPayload;
  // console.log("middleware isAuthenticated", isAuthenticated);
  // console.log("middleware payload", payload);
  // console.log(
  //   "middleware segment utm_campaign",
  //   segment?.payload?.utm_campaign
  // );

  if (!isCookies || !segment) {
    // console.log(
    //   "middleware isCookies ou segment nao encontrados então vai setar"
    // );
    // const cookies = getCookies(req.headers);

    if (!isCookies) {
      // console.log(
      //   "middleware vai setar isCookies"
      // );
      setISCookiesBag(cookies, ctx);
    }

    if (!segment) {
      // console.log(
      //   "middleware vai setar segment"
      // );
      setSegmentBag(cookies, req, ctx);
    }
  }

  return ctx.next!();
};
