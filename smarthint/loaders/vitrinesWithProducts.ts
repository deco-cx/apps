import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { Filter } from "./searchListPage.ts";
import { PageType } from "../utils/typings.ts";
import { Product } from "../../commerce/types.ts";
import { getUserHash } from "../utils/parseHeaders.ts";

export interface Props {
  filter?: Filter[];
  categories?: string;
  /**
   * @hide
   */
  products?: string[];
  position: string;
  pagetype: PageType;
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
    pagetype = "home",
    channel,
  } = props;

  const url = new URL(req.url)

  const anonymous = getUserHash(req.headers)
  
  const pageIdentifier = url.hostname == 'localhost' ? '' : new URL(url.origin, url.pathname)?.href

  const filterString = filter.length
    ? filter.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
      .join("&")
    : undefined;

  const productsString = productsParam.length
    ? productsParam.map((productId) => `productid:${productId}`).join("&")
    : undefined;


  const data = await recs["GET /recommendationByPage/withProducts"]({
    shcode,
    anonymous, 
    categories,
    channel,
    filter: filterString,
    pageIdentifier,
    pagetype,
    position,
    products: productsString,
  }).then((r) => r.json());

  console.log({data})

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
