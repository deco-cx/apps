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

  /**
   * @title Page Offset
   * @description 1 to start from index 1
   * @default 0
   */
  offset?: 1 | 0;
}

const withPage = (url: URL, page: number) => {
  const params = new URLSearchParams(url.searchParams);

  params.set("page", `${page}`);

  return `?${params}`;
};

/** @title VTEX Integration - Wishlist */
const loader = async (
  { count: recordPerPage, offset = 0 }: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? offset) - offset;
  const items = await wishlistLoader({ allRecords: true }, req, ctx);
  const records = items.length;
  const start = page * recordPerPage;
  const end = (page + 1) * recordPerPage;

  const products = items
    .map(({ sku, productId }): Product => ({
      "@type": "Product",
      inProductGroupWithID: productId,
      productID: sku,
      sku,
    }))
    .slice(start, end);

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
      currentPage: page + offset,
      nextPage: records > end ? withPage(url, page + 1 + offset) : undefined,
      previousPage: page > 0 ? withPage(url, page - 1 + offset) : undefined,
      recordPerPage,
      records,
    },
    sortOptions: [],
    seo: null,
  };
};

export default loader;
