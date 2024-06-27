import { AppContext } from "../mod.ts";
import { getFilterParam, toRecommendation } from "../utils/transform.ts";
import {
  ComplexPageType,
  FilterProp,
  SmarthintRecommendation,
} from "../utils/typings.ts";
import { getSessionCookie } from "../utils/getSession.ts";

export interface Props {
  /**
   * @hide
   */
  filter?: FilterProp[];
  /**
   * @hide
   */
  categories?: string;
  /**
   * @hide
   */
  products?: string[];
  /**
   * @description Your recommendations are divided by positions, defining which position of the recommendations according to your desire. All recommendations configured in the Admin Panel will be returned.
   */
  position: string;
  /**
   * @description Type of page you are setting up.
   */
  pagetype: ComplexPageType;
  /**
   * @default padrao
   */
  channel?: string;
}

function getProductParam(pagetype: ComplexPageType, productsParam: string[]) {
  if (productsParam.length) {
    return productsParam.map((productId) => `productid:${productId}`).join("&");
  }

  if (pagetype.type == "product" && pagetype.page) {
    return `productId:${(pagetype.page.product.isVariantOf?.productGroupID ??
      pagetype.page.product.productID)}`;
  }

  return;
}

export function getCategoriesParam(
  pagetype: ComplexPageType,
  categoriesParam?: string,
) {
  if (categoriesParam) return categoriesParam;

  if (pagetype.type == "category" && pagetype.page) {
    return pagetype.page.breadcrumb.itemListElement.map((item) => item.name)
      .join(
        " > ",
      );
  }

  return;
}

/**
 * @title SmartHint Integration
 * @description Recommendations
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SmarthintRecommendation[] | null> => {
  const { recs, shcode, publicUrl } = ctx;
  const {
    categories: categoriesParam,
    filter = [],
    position,
    products: productsParam = [],
    pagetype,
    channel = "padrao",
  } = props;

  const url = new URL(req.url);

  const { anonymous } = getSessionCookie(req.headers);

  const pageIdentifier = new URL(url.pathname, publicUrl)?.href;

  const filters = getFilterParam(url, filter);

  const productsString = getProductParam(pagetype, productsParam);

  const categories = getCategoriesParam(pagetype, categoriesParam);

  const data = await recs["GET /recommendationByPage/withProducts"]({
    shcode,
    anonymous,
    categories,
    channel,
    filter: filters,
    pageIdentifier,
    pagetype: pagetype.type,
    position,
    products: productsString,
  }).then((r) => r.json());

  const positionItem = data.find((item) =>
    Number(item.SmartHintPosition) == Number(position)
  );

  if (!positionItem) return null;

  const RecommendationsProducts =
    positionItem.RecommendationsProducts?.map((item) =>
      toRecommendation(item, position, "RecommendationsProducts", categories)
    ) ?? [];
  const RecommendationsPromotional =
    positionItem.RecommendationsProducts?.map((item) =>
      toRecommendation(item, position, "RecommendationsPromotional", categories)
    ) ?? [];
  const RecommendationsCombination =
    positionItem.RecommendationsProducts?.map((item) =>
      toRecommendation(item, position, "RecommendationsCombination", categories)
    ) ?? [];
  const Recommendations =
    positionItem.RecommendationsProducts?.map((item) =>
      toRecommendation(item, position, "Recommendations", categories)
    ) ?? [];

  const allItems: SmarthintRecommendation[] = [
    ...RecommendationsProducts,
    ...RecommendationsPromotional,
    ...RecommendationsCombination,
    ...Recommendations,
  ];

  const sortedItem = allItems.toSorted((a, b) => a.order! - b.order!);

  return sortedItem;
};

export default loader;
