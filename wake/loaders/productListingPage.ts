import type { ProductListingPage } from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { Search } from "../utils/graphql/queries.ts";
import {
  ProductFragment,
  ProductSortKeys,
  SearchQuery,
  SearchQueryVariables,
  SortDirection,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { FILTER_PARAM, toFilters, toProduct } from "../utils/transform.ts";

export type Sort =
  | "ASC:NAME"
  | "DESC:NAME"
  | "DESC:RELEASE_DATE"
  | "ASC:PRICE"
  | "DESC:PRICE"
  | "DESC:DISCOUNT"
  | "DESC:SALES";

export const SORT_OPTIONS: SortOption[] = [
  { value: "ASC:NAME", label: "Nome A-Z" },
  { value: "DESC:NAME", label: "Nome Z-A" },
  { value: "DESC:RELEASE_DATE", label: "Lançamentos" },
  { value: "ASC:PRICE", label: "Menores Preços" },
  { value: "DESC:PRICE", label: "Maiores Preços" },
  { value: "DESC:DISCOUNT", label: "Maiores Descontos" },
  { value: "DESC:SALES", label: "Mais Vendidos" },
];

type SortValue = `${SortDirection}:${ProductSortKeys}`;
export interface Props {
  /**
   * @title Count
   * @description Number of products to display
   */
  first?: number;

  /** @description Types of operations to perform between query terms */
  operation?: "AND" | "OR";

  /**
   * @ignore
   */
  page: number;

  /**
   * @title Sorting
   */
  sort?: Sort;

  /**
   * @description overides the query term
   */
  query?: string;

  filters: {
    /** @description The set of attributes to filter. */
    attributes?: {
      id?: string[];
      name?: string[];
      type?: string[];
      value?: string[];
    };
    /** @description Choose if you want to retrieve only the available products in stock. */
    available?: boolean;
    /** @description The set of brand IDs which the result item brand ID must be included in. */
    brandId?: string[];
    /** @description The set of category IDs which the result item category ID must be included in. */
    categoryId?: string[];
    /** @description The set of EANs which the result item EAN must be included. */
    ean?: string[];
    /** @description Retrieve the product variant only if it contains images. */
    hasImages?: boolean;
    /** @description Retrieve the product variant only if it is the main product variant. */
    mainVariant?: boolean;
    /** @description The set of prices to filter. */
    prices?: {
      /** @description The product discount must be greater than or equal to. */
      discount_gte?: number;
      /** @description The product discount must be lesser than or equal to. */
      discount_lte?: number;
      /** @description Return only products where the listed price is more than the price. */
      discounted?: boolean;
      /** @description The product price must be greater than or equal to. */
      price_gte?: number;
      /** @description The product price must be lesser than or equal to. */
      price_lte?: number;
    };
    /** @description The product unique identifier (you may provide a list of IDs if needed). */
    productId?: number[];
    /** @description The product variant unique identifier (you may provide a list of IDs if needed). */
    productVariantId?: number[];
    /** @description A product ID or a list of IDs to search for other products with the same parent ID. */
    sameParentAs?: number[];
    /** @description The set of SKUs which the result item SKU must be included. */
    sku?: string[];
    /** @description Show products with a quantity of available products in stock greater than or equal to the given number. */
    stock_gte?: number;
    /** @description Show products with a quantity of available products in stock less than or equal to the given number. */
    stock_lte?: number;
    /** @description The set of stocks to filter. */
    stocks?: {
      dcId?: number[];
      /** @description The distribution center names to match. */
      dcName?: string[];
      /** @description The product stock must be greater than or equal to. */
      stock_gte?: number;
      /** @description The product stock must be lesser than or equal to. */
      stock_lte?: number;
    };
    /** @description Retrieve products which the last update date is greater than or equal to the given date. */
    updatedAt_gte?: string;
    /** @description Retrieve products which the last update date is less than or equal to the given date. */
    updatedAt_lte?: string;
  };
}

const filtersFromParams = (searchParams: URLSearchParams) => {
  const mapped = searchParams.getAll(FILTER_PARAM).reduce((acc, value) => {
    const [field, val] = value.split(":");
    if (!acc.has(field)) acc.set(field, []);
    acc.get(field)?.push(val);
    return acc;
  }, new Map<string, string[]>());

  const filters: Array<{ field: string; values: string[] }> = [];
  for (const [field, values] of mapped.entries()) {
    filters.push({ field, values });
  }

  return filters;
};

/**
 * @title Wake Integration
 * @description Product Listing Page loader
 */
const searchLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<ProductListingPage | null> => {
  // get url from params
  const url = new URL(req.url);
  const { storefront } = ctx;

  const first = props.first ?? 12;
  const filters = filtersFromParams(url.searchParams) ?? props.filters;
  const sort =
    (url.searchParams.get("sort") as SortValue | null) ??
    props.sort ??
    "DESC:SALES";
  const page = props.page ?? (Number(url.searchParams.get("page")) || 0);
  const query = props.query ?? url.searchParams.get("s");
  const operation = props.operation ?? "AND";
  const [sortDirection, sortKey] = sort.split(":") as [
    SortDirection,
    ProductSortKeys
  ];

  const data = await storefront.query<SearchQuery, SearchQueryVariables>({
    variables: { query, operation, first, sortDirection, sortKey, filters },
    ...Search,
  });

  const products = data.search?.products?.nodes ?? [];
  const pageInfo = data.search?.products?.pageInfo;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (pageInfo?.hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }
  if (pageInfo?.hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  const itemListElement: ProductListingPage["breadcrumb"]["itemListElement"] =
    data.search?.breadcrumbs?.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: b!.link!,
      name: b!.text!,
    })) ?? [];

  return {
    "@type": "ProductListingPage",
    filters: toFilters(data.search?.aggregations, { base: url }),
    pageInfo: {
      nextPage: pageInfo?.hasNextPage ? `?${nextPage}` : undefined,
      previousPage: pageInfo?.hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage: page,
      records: data.search?.products?.totalCount,
      recordPerPage: first,
    },
    sortOptions: SORT_OPTIONS,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    products: products
      ?.filter((p): p is ProductFragment => Boolean(p))
      .map((variant) => toProduct(variant, { base: url })),
  };
};

export default searchLoader;
