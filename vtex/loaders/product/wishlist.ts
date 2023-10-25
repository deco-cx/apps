import { Product, ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import wishlistLoader from "../wishlist.ts";

export interface Props {
  /**
   * @title Items per page
   * @description Number of products per page to display
   * @default 12
   */
  count: number;
}

/** @title VTEX Integration - Wishlist */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const items = await wishlistLoader(props, req, ctx);

  const products = items.map((i): Product => ({
    "@type": "Product",
    productID: i.sku,
    inProductGroupWithID: i.productId,
    sku: i.sku,
  }));

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: [],
    products,
    pageInfo: {
      currentPage: 0,
      nextPage: undefined,
      previousPage: undefined,
      records: products.length,
      recordPerPage: products.length,
    },
    sortOptions: [],
    seo: null,
  };
};

export default loader;
