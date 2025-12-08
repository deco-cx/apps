import { Cookie, getCookies, getSetCookies } from "std/http/mod.ts";
import { stringify } from "./cookies.ts";
import { MarketingData } from "./types.ts";

const VTEX_CHECKOUT_COOKIE = "checkout.vtex.com";

export const getCheckoutVtexCookie = (headers: Headers) => {
  const cookies = getSetCookies(headers);
  return cookies.find((cookie) => cookie.name === VTEX_CHECKOUT_COOKIE)?.value;
};

export const safelySetCheckoutVtexCookie = (
  cookieString: string,
  orderFormId: string,
) => {
  if (cookieString.includes(VTEX_CHECKOUT_COOKIE)) {
    return cookieString;
  }
  return `${cookieString}; ${VTEX_CHECKOUT_COOKIE}=${orderFormId}`;
};

export const parseCookie = (headers: Headers) => {
  const cookies = getCookies(headers);
  const ofidCookie = cookies[VTEX_CHECKOUT_COOKIE];

  /**
   * There are two cookies present for VTEX Auth:
   *
   * - VtexIdClientAutCookie_{accountName}
   * - VtexIdClientAutCookie_{crypto.randomUuid()}
   *
   * Here, we sort them to get the first one and pass forward its value
   */
  const authCookieName = Object.keys(cookies).toSorted((a, z) =>
    a.length - z.length
  ).find((cookieName) => cookieName.startsWith("VtexIdclientAutCookie"));

  const authCookie = authCookieName ? cookies[authCookieName] : undefined;

  if (ofidCookie == null) {
    return {
      orderFormId: "",
      cookie: "",
    };
  }

  if (!/^__ofid=([0-9a-fA-F])+$/.test(ofidCookie)) {
    throw new Error(
      `Not a valid VTEX orderForm cookie. Expected: /^__ofid=([0-9])+$/, receveid: ${ofidCookie}`,
    );
  }

  const [_, id] = ofidCookie.split("=");

  return {
    orderFormId: id,
    cookie: stringify({
      [VTEX_CHECKOUT_COOKIE]: ofidCookie,
      ...(authCookieName && { [authCookieName]: authCookie }),
    }),
  };
};

export const formatCookie = (orderFormId: string): Cookie => ({
  value: `__ofid=${orderFormId}`,
  name: "checkout.vtex.com",
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
});

export const hasDifferentMarketingData = (
  md1: MarketingData,
  md2: MarketingData,
) => {
  const someDifferent = Object.keys(md1).some((key) =>
    md1[key as keyof MarketingData] !== md2[key as keyof MarketingData]
  );
  return someDifferent;
};
