import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { Filter } from "./searchListPage.ts";
import { ComplexPageType } from "../utils/typings.ts";
import { Product, ProductListingPage } from "../../commerce/types.ts";
import { getSessionCookie } from "../utils/getSession.ts";

/**
 * @title Product
 */
export interface Teste {
  page: ProductListingPage;
}

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
  position: string;
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
  products?: Product[];
  bannerUrl?: string;
  bannerUrlClick?: string;
  bannerHtml?: string;
  positionBanner?: "First" | "Last";
  hasTimer: boolean;
  startDateTime: string;
  endDateTime: string;
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
  const { recs, shcode } = ctx;
  const {
    categories,
    filter = [],
    position,
    products: productsParam = [],
    pagetype,
    channel,
  } = props;

  const url = new URL(req.url);

  const anonymous = getSessionCookie(req.headers);

  const pageIdentifier = url.hostname == "localhost"
    ? ""
    : new URL(url.pathname, url.origin)?.href.replace("/smarthint", ""); // todo remove

  const filterString = filter.length
    ? filter.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
      .join("&")
    : undefined;

  const productsString = productsParam.length
    ? productsParam.map((productId) => `productid:${productId}`).join("&")
    : pagetype.type == "product" && pagetype.page
    ? `productId:${(pagetype.page.product.isVariantOf?.productGroupID ??
      pagetype.page.product.productID)}`
    : undefined;

  console.log(pagetype);

  const data = await recs["GET /recommendationByPage/withProducts"]({
    shcode,
    anonymous,
    categories,
    channel,
    filter: filterString,
    pageIdentifier,
    pagetype: pagetype.type,
    position,
    products: productsString,
  }).then((r) => r.json());

  console.log({ data });

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
    products: item.Products?.map((product) => toProduct(product)) ?? [],
  }));
};

export default loader;
