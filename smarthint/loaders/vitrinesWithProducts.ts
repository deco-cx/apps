import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { Filter } from "./searchListPage.ts";
import { PageType } from "../utils/typings.ts";
import { Product } from "../../commerce/types.ts";

export interface Props {
  filter: Filter[]
  categories: string
  products: string
  position: string
  pageIdentifier: string
  pagetype: PageType,
  channel: string
}

export interface SmarthintPosition {
  titleRecommendation?: string,
  eventGoogleAnalytics?: string
  products?: Product[]
  bannerUrl?: string
  bannerUrlClick?: string
  bannerHtml?: string
  positionBanner?: "First" | "Last",
  hasTimer: boolean,              
  startDateTime: string,
  endDateTime: string
}


/**
 * @title Smarthint Integration
 * @description Product List Page
 */
const action = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<SmarthintPosition[] | null> => {
  const { api, shcode } = ctx;
  const {categories,filter,pageIdentifier,position,products: productsParam,pagetype, channel} = props

  const url = new URL(req.url);

  const filterString = filter.map(filterItem => `${filterItem.field}:${filterItem.value}`).join('&')

  const data = await api["GET /recommendationByPage/withProducts"]({
    shcode,
    anonymous: "1", //TODO,
    categories,
    channel,  
    filter: filterString,
    pageIdentifier,
    pagetype,
    position,
    products: productsParam
  }).then((r) => r.json());

  const positionItem = data.find(item => item["smarthint-position"] == position)

  if(!positionItem) return null

  const {recommendationsProducts = [],recommendationsPromotional= [],recommendationsCombination=[], recommendations=[] } = positionItem

  const allItems = [
    ...recommendationsProducts,
    ...recommendationsPromotional,
    ...recommendationsCombination,
    ...recommendations
  ]

  const sortedItem = allItems.toSorted((a, b) => a.order! - b.order!)

  return sortedItem.map(item => ({
    eventGoogleAnalytics: item.eventGoogleAnalytics,
    titleRecommendation: item.titleRecommendation,
    products: item.products?.map(product => toProduct(product)) ?? []
  }))
};

export default action;
