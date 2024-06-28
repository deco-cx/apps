import { AppContext } from "../mod.ts";
import { getFilterParam, toRecommendation } from "../utils/transform.ts";
import {
  ComplexPageType,
  FilterProp,
  SmarthintRecommendation,
} from "../utils/typings.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { Category } from "../../commerce/types.ts";

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

export const buildCategoryParam = ({
  segments,
  path = "",
  categoryList,
  names = [],
  url,
}: {
  segments: string[];
  path?: string;
  categoryList: Category[];
  names?: string[];
  url: URL;
}): string | undefined => {
  if (segments.length === 0) return names.join(" > ");

  const [segment, ...restSegments] = segments;
  const newPath = `${path}/${segment}`;

  const matchedCategory = categoryList.find((category) => {
    const categoryUrl = new URL(category.url, url.origin);
    return categoryUrl.pathname === newPath;
  });

  if (!matchedCategory) return;

  return buildCategoryParam({
    segments: restSegments,
    path: newPath,
    categoryList: matchedCategory.children || [],
    names: [...names, matchedCategory.name],
    url,
  });
};

export function getCategoriesParam({
  categoriesParam,
  categoryTree,
  url,
}: {
  categoriesParam?: string;
  url: URL;
  categoryTree?: Category | Category[];
}): string | undefined {
  if (categoriesParam) return categoriesParam;
  if (!categoryTree) return;

  const categoryTreeList = Array.isArray(categoryTree)
    ? categoryTree
    : [categoryTree];
  const urlSegments = url.pathname.split("/").filter(Boolean);

  return buildCategoryParam({
    segments: urlSegments,
    categoryList: categoryTreeList,
    url,
  });
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
  const { recs, shcode, publicUrl, categoryTree } = ctx;
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

  const categories = getCategoriesParam({
    categoriesParam,
    categoryTree,
    url,
  });

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
