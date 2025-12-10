import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import {
  getCheckoutVtexCookie,
  hasDifferentMarketingData,
  parseCookie,
} from "../utils/orderForm.ts";
import {
  getOrderFormIdFromBag as getCheckoutVtexCookieFromBag,
  getSegmentFromBag,
  setOrderFormIdInBag as setCheckoutVtexCookieInBag,
} from "../utils/segment.ts";
import type { MarketingData, OrderForm } from "../utils/types.ts";
import { DEFAULT_EXPECTED_SECTIONS } from "../actions/cart/removeItemAttachment.ts";
import { forceHttpsOnAssets } from "../utils/transform.ts";
import { safelySetCheckoutVtexCookie } from "../utils/orderForm.ts";
import { getCookies } from "std/http/mod.ts";
import { logger } from "@deco/deco/o11y";

const safeParseJwt = (cookie: string) => {
  try {
    return [JSON.parse(atob(cookie.split(".")[1])), null];
  } catch (e) {
    return [null, e];
  }
};

const logMismatchedCart = (cart: OrderForm, req: Request, ctx: AppContext) => {
  const email = cart?.clientProfileData?.email;
  const cookies = getCookies(req.headers);

  const userFromCookie = cookies[`VtexIdclientAutCookie_${ctx.account}`];

  const [jwtPayload, _error] = userFromCookie
    ? safeParseJwt(userFromCookie)
    : [null, null];

  const emailFromCookie = jwtPayload?.sub;
  const userIdFromCookie = jwtPayload?.userId;

  const orderFormIdFromRequest = cookies["checkout.vtex.com"]?.split("=").at(1);

  if (
    userFromCookie &&
    typeof emailFromCookie === "string" &&
    typeof email === "string" &&
    emailFromCookie !== email
  ) {
    const headersDenyList = new Set(["cookie", "cache-control"]);

    const hasTwoCookies =
      req.headers.get("cookie")?.split("checkout.vtex.com")?.length === 3;

    logger.warn(`Cookie cart mismatch`, {
      hasTwoCookies,
      OrderFormId: cart?.orderFormId,
      OrderFormIdFromRequest: orderFormIdFromRequest,
      EmailFromCookie: emailFromCookie,
      EmailFromOrderForm: email,
      UserIdFromCookie: userIdFromCookie,
      UserIdFromOrderForm: cart?.userProfileId,
      reqUrl: req.url,
      reqHeaders: Object.fromEntries(
        Array.from(req.headers.entries()).filter(([key]) =>
          !headersDenyList.has(key)
        ),
      ),
    });
  }
};

export const cache = "no-store";
/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 * @title Get Cart
 * @description Get the cart from the user logged in
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers);
  const segment = getSegmentFromBag(ctx);
  const maybeOrderFormId = getCheckoutVtexCookieFromBag(ctx);
  const orderFormId = maybeOrderFormId ? await maybeOrderFormId : undefined;
  const withOrderFormIdCookie = orderFormId
    ? safelySetCheckoutVtexCookie(cookie, orderFormId)
    : cookie;
  const responsePromise = vcsDeprecated["POST /api/checkout/pub/orderForm"](
    { sc: segment?.payload?.channel },
    { headers: { cookie: withOrderFormIdCookie } },
  );

  setCheckoutVtexCookieInBag(
    ctx,
    responsePromise.then((response) => getCheckoutVtexCookie(response.headers)),
  );

  const response = await responsePromise;

  const cart = await response.json() as OrderForm;

  // Temporary logging to check for cart mismatch
  logMismatchedCart(cart, req, ctx);

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  if (!segment?.payload) {
    return forceHttpsOnAssets(cart);
  }

  const {
    payload: {
      utm_campaign,
      utm_source,
      utm_medium,
      utmi_campaign,
      utmi_part,
      utmi_page,
    },
  } = segment;

  const hasUtm = utm_campaign || utm_source || utm_medium || utmi_campaign ||
    utmi_page || utmi_part;

  if (hasUtm) {
    const marketingData: MarketingData = {
      utmCampaign: utm_campaign || cart.marketingData?.utmCampaign,
      utmSource: utm_source || cart.marketingData?.utmSource,
      utmMedium: utm_medium || cart.marketingData?.utmMedium,
      utmiCampaign: utmi_campaign || cart.marketingData?.utmiCampaign,
      utmiPage: utmi_page || cart.marketingData?.utmiPage,
      utmiPart: utmi_part || cart.marketingData?.utmiPart,
      marketingTags: cart.marketingData?.marketingTags,
      coupon: cart.marketingData?.coupon,
    };

    if (
      !cart.marketingData ||
      hasDifferentMarketingData(cart.marketingData, marketingData)
    ) {
      const expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS;
      const result = await vcsDeprecated
        ["POST /api/checkout/pub/orderForm/:orderFormId/attachments/:attachment"](
          {
            orderFormId: cart.orderFormId,
            attachment: "marketingData",
            sc: segment?.payload.channel,
          },
          {
            body: { expectedOrderFormSections, ...marketingData },
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              cookie: withOrderFormIdCookie,
            },
          },
        );
      return forceHttpsOnAssets((await result.json()) as OrderForm);
    }
  }

  return forceHttpsOnAssets(cart);
};

export default loader;
