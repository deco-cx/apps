import { AppContext } from "../../mod.ts";
import { proxySetCookie } from "../../utils/cookies.ts";
import { parseCookie } from "../../utils/orderForm.ts";
import type { OrderForm } from "../../utils/types.ts";
import { getSegmentFromBag } from "../../utils/segment.ts";

export interface Props {
  /** @description index of the item in the cart.items array you want to edit */
  index: number;
  /** @description attachment name */
  attachment: string;
  content: Record<string, string>;
  expectedOrderFormSections?: string[];
  noSplitItem?: boolean;
}

export const DEFAULT_EXPECTED_SECTIONS = [
  "items",
  "totalizers",
  "clientProfileData",
  "shippingData",
  "paymentData",
  "sellers",
  "messages",
  "marketingData",
  "clientPreferencesData",
  "storePreferencesData",
  "giftRegistryData",
  "ratesAndBenefitsData",
  "openTextField",
  "commercialConditionData",
  "customData",
];

const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<OrderForm> => {
  const { vcsDeprecated } = ctx;
  const {
    index,
    attachment,
    content,
    noSplitItem = true,
    expectedOrderFormSections = DEFAULT_EXPECTED_SECTIONS,
  } = props;
  const { orderFormId } = parseCookie(req.headers);
  const cookie = req.headers.get("cookie") ?? "";
  const segment = getSegmentFromBag(ctx);

  const response = await vcsDeprecated
    ["DELETE /api/checkout/pub/orderForm/:orderFormId/items/:index/attachments/:attachment"](
      { orderFormId, attachment, index, sc: segment?.payload.channel },
      {
        body: { content, noSplitItem, expectedOrderFormSections },
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          cookie,
        },
      },
    );

  proxySetCookie(response.headers, ctx.response.headers, req.url);

  return response.json();
};

export default action;
