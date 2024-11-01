import type { ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toProduct } from "../../utils/transform.ts";
import { Order, OrderBy, Status, StockStatus } from "../../utils/types.ts";
import { WOOCOMMERCE_SORT_OPTIONS } from "../../utils/utils.ts";

export interface Props {
  /**
   * @description overrides the query term at url
   */
  query?: string;
  /**
   * @default 1
   */
  page: number;
  /**
   * @title Per Page
   * @default 12
   * @description Maximum number of items to be returned in result set. Default is 12.
   */
  per_page: number;
  order?: Order;
  order_by?: OrderBy;
  status?: Status;
  stock_status?: StockStatus;
}

/**
 * @title WooCommerce Integration
 * @description Product Listing Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> {
  const url = new URL(req.url);
  const pathname = url.pathname.split("/").filter(Boolean).pop();

  const { page = 1, per_page = 12, query } = props;
  const { api } = ctx;

  const category = await ctx.invoke.woocommerce.loaders.product.productCategory(
    {
      slug: pathname,
    },
  );

  const products = await api["GET /wc/v3/products"]({
    ...props,
    page,
    per_page,
    category: !query ? category?.id?.toString() : undefined,
    search: query,
  }).then((res) => res.json());

  if (!products) return null;

  const totalPages = Math.ceil((category?.count ?? 0) / props.per_page);
  const notHasNextPage = totalPages == page;

  return {
    "@type": "ProductListingPage",
    products: products.map((product) => toProduct(product)),
    sortOptions: WOOCOMMERCE_SORT_OPTIONS,
    filters: [],
    pageInfo: {
      previousPage: page == 1 ? undefined : Number(page + 1).toString(),
      currentPage: page,
      nextPage: notHasNextPage ? undefined : Number(page + 1).toString(),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem" as const,
          name: category?.name,
          position: 1,
          item: new URL(category?.slug ?? "").href,
        },
      ],
      numberOfItems: category?.count ?? 0,
    },
    seo: {
      title: query || category?.name || pathname?.replaceAll("-", " ") || "",
      description: category?.description ?? "",
      canonical: pathname || req.url,
    },
  };
}

export default loader;
