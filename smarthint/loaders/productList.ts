import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { getFilterParam, toProduct } from "../utils/transform.ts";
import { ComplexPageType, FilterProp } from "../utils/typings.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { getCategoriesParam, getProductParam } from "./recommendations.ts";

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

/**
 * @title SmartHint Integration
 * @description Product List from Recommendations (for ProductShelf)
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
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

  const products: Product[] = [];

  // Extract products from RecommendationsProducts
  positionItem.RecommendationsProducts?.forEach((rec) => {
    rec.Products?.forEach((p) => products.push(toProduct(p)));
  });

  // Extract products from RecommendationsPromotional
  positionItem.RecommendationsPromotional?.forEach((rec) => {
    rec.Products?.forEach((p) => products.push(toProduct(p)));
  });

  // Extract products from RecommendationsCombination combos
  positionItem.RecommendationsCombination?.forEach((rec) => {
    rec.combos?.forEach((combo) => {
      combo.Products?.forEach((p) => products.push(toProduct(p)));
    });
  });

  return products.length ? products : null;
};

export default loader;
