import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { Filter } from "./searchListPage.ts";
import { PageType } from "../utils/typings.ts";

export interface Props {
  filter: Filter[];
  categories: string;
  products: string;
  position: string;
  pageIdentifier: string;
  pagetype: PageType;
  channel: string;
}

/**
 * @title Smarthint Integration
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode } = ctx;
  const {
    categories,
    filter,
    pageIdentifier,
    position,
    products: productsParam,
    pagetype,
    channel,
  } = props;

  const url = new URL(req.url);

  const filterString = filter.map((filterItem) =>
    `${filterItem.field}:${filterItem.value}`
  ).join("&");

  const data = await api["GET /recommendationByPage"]({
    shCode: shcode,
    anonymous: "1", //TODO,
    categories,
    channel,
    filter: filterString,
    pageIdentifier,
    pagetype,
    position,
    products: productsParam,
  }).then((r) => r.json());

  if (data.SearchResult?.IsRedirect) {
    redirect(
      new URL(data.SearchResult?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products =
    data.SearchResult?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data.SearchResult?.Sorts ?? []);

  const filters = toFilters(data.SearchResult?.Filters ?? []);

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    filters,
    pageInfo: {
      records: data.SearchResult?.TotalResult,
    },
  };
};

export default loader;
