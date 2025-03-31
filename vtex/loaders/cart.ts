import { AppContext } from "../mod.ts";
import { proxySetCookie } from "../utils/cookies.ts";
import { hasDifferentMarketingData, parseCookie } from "../utils/orderForm.ts";
import { getSegmentFromBag } from "../utils/segment.ts";
import type { MarketingData, OrderForm } from "../utils/types.ts";
import { DEFAULT_EXPECTED_SECTIONS } from "../actions/cart/removeItemAttachment.ts";
import { forceHttpsOnAssets } from "../utils/transform.ts";

/**
 * @docs https://developers.vtex.com/docs/api-reference/checkout-api#get-/api/checkout/pub/orderForm
 */
const loader = async (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const { cookie } = parseCookie(req.headers);
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated["POST /api/checkout/pub/orderForm"](
    { sc: segment?.payload?.channel },
    { headers: { cookie } },
  );

  const result = response.json();

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  if (!segment?.payload) {
    return forceHttpsOnAssets((await result) as OrderForm);
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

  const cart = await result;
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
              cookie,
            },
          },
        );
      return forceHttpsOnAssets((await result.json()) as OrderForm);
    }
  }

  return forceHttpsOnAssets((await result) as OrderForm);
};

export default loader;
