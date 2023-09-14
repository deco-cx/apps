import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../../linx/mod.ts";
import { toProduct } from "../utils/transform.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;

  /**
   * Slug for category pages
   */
  slug?: RequestURLParam;

  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
}

/**
 * @title Linx Integration
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { api } = ctx;
  const qQueryString = url.searchParams.get("q");
  const apiSelect = props.slug ? "Category" : "Search";
  const term = props.term || props.slug || qQueryString ||
    "";

  // const count = props.count ?? 12;
  const page = Number(url.searchParams.get("page")) ?? 0;

  // search products on Linx. Feel free to change any of these parameters
  const data = await api
    [`GET /web-api/v1/Catalog/Products/${apiSelect}/:id/?catalogID=1`]({
      id: term,
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json());

  // Transform Linx product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = data.Products.map((product) =>
    toProduct(ctx, product, {
      url,
      priceCurrency: "BRL",
    })
  );

  const hasNextPage = Boolean(data?.PageInfo?.HasNextPage ?? false);
  const hasPreviousPage = false;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    "@type": "ProductListingPage",
    // TODO: Find out what's the right breadcrumb on Linx
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: [],
    products: products ?? [],
    pageInfo: {
      nextPage: hasNextPage ? nextPage.toString() : undefined,
      previousPage: hasPreviousPage ? previousPage.toString() : undefined,
      currentPage: page,
    },
    sortOptions: [],
  };
};

export default loader;
