import { AppContext } from "../mod.ts";
import { getFilterParam, toProduct } from "../utils/transform.ts";
import { ComplexPageType, Filter, PageType } from "../utils/typings.ts";
import { Product } from "../../commerce/types.ts";
import { getSessionCookie } from "../utils/getSession.ts";

export interface Props {
  /**
   * @hide
   */
  filter?: Filter[];
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

export interface SmarthintPosition {
  titleRecommendation?: string;
  eventGoogleAnalytics?: string;
  nameRecommendation?: string;
  products: Product[] | null;
  bannerUrl?: string;
  bannerUrlClick?: string;
  bannerHtml?: string;
  positionBanner?: "First" | "Last";
  hasTimer: boolean;
  startDateTime: string;
  endDateTime: string;
  position: string;
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

function getCategoriesParam(
  pagetype: ComplexPageType,
  categoriesParam?: string,
) {
  if (categoriesParam) return categoriesParam;

  if (pagetype.type == "category" && pagetype.page) {
    pagetype.page?.breadcrumb.itemListElement.map((item) => item.name).join(
      " > ",
    );
  }

  return;
}

/**
 * @title Smarthint Integration
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SmarthintPosition[] | null> => {
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

  const anonymous = getSessionCookie(req.headers);

  // to work in localhost
  const origin = (new URL(
    publicUrl?.startsWith("http") ? publicUrl : `https://${publicUrl}`,
  )).origin;

  const pageIdentifier = new URL(url.pathname, origin)?.href.replace(
    "/smarthint",
    "",
  ); // todo remove replace

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

  const {
    RecommendationsProducts = [],
    RecommendationsPromotional = [],
    RecommendationsCombination = [],
    Recommendations = [],
  } = positionItem;

  const allItems = [
    ...RecommendationsProducts,
    ...RecommendationsPromotional,
    ...RecommendationsCombination,
    ...Recommendations,
  ];

  const sortedItem = allItems.toSorted((a, b) => a.Order! - b.Order!);

  return sortedItem.map((item) => ({
    eventGoogleAnalytics: item.EventGoogleAnalytics,
    titleRecommendation: item.TitleRecommendation,
    nameRecommendation: item.NameRecommendation,
    position,
    products: item.Products?.map((product) => toProduct(product)) || null,
  }));
};

export default loader;
