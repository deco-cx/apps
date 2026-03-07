import { Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { getOrigin, parseCookie } from "../../utils/recommendations.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { toProduct } from "../../utils/transform.ts";
import {
  CampaignType,
  LegacyProduct,
  ProductListToId,
} from "../../utils/types.ts";
import { getFirstItemAvailable } from "../legacy/productListingPage.ts";

type CampaignTypeLabel =
  | "Best sellers"
  | "Personalized recommendations"
  | "Similar items"
  | "Cross-sell"
  | "Cart-based recommendations"
  | "Last seen"
  | "Recent interactions"
  | "Visual similarity"
  | "Search-based recommendations"
  | "Next interaction";

const campaignTypeMap: Record<CampaignTypeLabel, CampaignType> = {
  "Best sellers": "rec-top-items-v2",
  "Personalized recommendations": "rec-persona-v2",
  "Similar items": "rec-similar-v2",
  "Cross-sell": "rec-cross-v2",
  "Cart-based recommendations": "rec-cart-v2",
  "Last seen": "rec-last-v2",
  "Recent interactions": "rec-interactions-v2",
  "Visual similarity": "rec-visual-v2",
  "Search-based recommendations": "rec-search-v2",
  "Next interaction": "rec-next-v2",
};

interface Props {
  /**
   * @title Campaign Type
   * @description The type of campaign to fetch recommendations for.
   */
  campaignType: CampaignTypeLabel;
  /**
   * @title Campaign ID
   * @description Contact https://supporticket.vtex.com/support to get the campaign ID.
   */
  campaignId: string;
  /**
   * @title Products
   * @description List of product IDs for context-based recommendations. For similar items and cross-sell, send only one product ID. For cart recommendations, send all product IDs in the user's cart.
   */
  products?: ProductListToId;
  /**
   * @title Zip Code
   * @description Zip code for location-based recommendations. If not provided, it is extracted from the segment cookie.
   */
  zipCode?: string;
  /**
   * @title Pickup Point
   * @description Pickup point identifier for location-based recommendations. If not provided, it is extracted from the segment cookie.
   */
  pickupPoint?: string;
  /**
   * @title Region ID
   * @description Region identifier for location-based recommendations. If not provided, it is extracted from the segment cookie.
   */
  regionId?: string;
  /**
   * @ignore true
   */
  "x-vtex-rec-origin"?: string;
}

/**
 * @title VTEX Recommendations Product List
 * @description Get a list of products from the VTEX Recommendations API
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  try {
    const { bff, account } = ctx;

    const origin = getOrigin(req, ctx.account, props["x-vtex-rec-origin"]);
    const segment = getSegmentFromBag(ctx);
    const cookies = parseCookie(req.headers);

    let userId = cookies?.userId;

    if (ctx.advancedConfigs?.autoStartRecommendationSession && !userId) {
      const response = await ctx.invoke.vtex.actions.recommendation
        .startSession();
      userId = response.recommendationsUserId;
    }

    const campaignType = campaignTypeMap[props.campaignType];
    const campaignVrn =
      `vrn:recommendations:${account}:${campaignType}:${props.campaignId}`;

    // From vtex docs:
    // "For similar items and cross-sell, send only one product ID.
    // For cart recommendations, send all product IDs in the user's cart."
    const products =
      campaignType === "rec-cross-v2" || campaignType === "rec-similar-v2"
        ? [props.products?.[0]]
        : props.products;

    const productIds = products?.filter(Boolean).join(",");

    const response = await bff["GET /api/recommend-bff/v2/recommendations"]({
      an: account,
      campaignVrn,
      pickupPoint: props.pickupPoint,
      regionId: props.regionId,
      zipCode: props.zipCode,
      userId,
      products: productIds,
      salesChannel: segment?.payload?.channel || ctx.salesChannel,
    }, {
      headers: { ...withSegmentCookie(segment), "x-vtex-rec-origin": origin },
    }).then((res) => res.json());

    const baseUrl = new URL(req.url).origin;

    return (response.products as unknown as LegacyProduct[]).map((product) =>
      toProduct(
        product,
        product.items.find(getFirstItemAvailable) ?? product.items[0],
        0,
        {
          baseUrl,
          priceCurrency: segment?.payload?.currencyCode ?? "BRL",
          isVariantOfAdditionalProperty: [
            {
              "@type": "PropertyValue",
              name: "correlationId",
              value: response.correlationId,
              valueReference: "RECOMMENDATION",
            },
            {
              "@type": "PropertyValue",
              name: "campaignId",
              value: response.campaign?.id,
              valueReference: "RECOMMENDATION",
            },
            {
              "@type": "PropertyValue",
              name: "campaignTitle",
              value: response.campaign?.title,
              valueReference: "RECOMMENDATION",
            },
            {
              "@type": "PropertyValue",
              name: "campaignType",
              value: response.campaign?.type,
              valueReference: "RECOMMENDATION",
            },
          ],
        },
      )
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}
