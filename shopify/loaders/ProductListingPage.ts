import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { gql } from "../../utils/graphql.ts";
import { fragment as productFragment } from "../utils/fragments/product.ts";
import { fragment as variantFragment } from "../utils/fragments/productVariant.ts";
import {
  SearchProductsQuery,
  SearchProductsQueryVariables,
} from "../utils/storefront.graphql.gen.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /**
   * @description overides the query term
   */
  query?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
}

/**
 * @title Shopify Integration
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { storefront } = ctx;

  const count = props.count ?? 12;
  const query = props.query || url.searchParams.get("q") || "";
  const page = Number(url.searchParams.get("page")) ?? 0;

  const data = await storefront.query<
    SearchProductsQuery,
    SearchProductsQueryVariables
  >({
    variables: { first: count, query: query },
    fragments: [productFragment, variantFragment],
    query:
      gql`query SearchProducts($first: Int, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        pageInfo {
          hasNextPage
        }
        nodes {
          ...Product
        }
      }
    }`,
  });

  // Transform Shopify product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = data?.products.nodes.map((p) =>
    toProduct(p, p.variants.nodes[0], new URL(req.url))
  );

  const hasNextPage = Boolean(data?.products.pageInfo.hasNextPage ?? false);
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
    // TODO: Find out what's the right breadcrumb on shopify
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
