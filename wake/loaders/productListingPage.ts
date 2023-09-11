import type { ProductListingPage } from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
import { gql } from "../../utils/graphql.ts";
import type { AppContext } from "../mod.ts";
import { fragment } from "../utils/graphql/fragments/product.ts";
import {
  ProductFragment,
  ProductSortKeys,
  SearchQuery,
  SearchQueryVariables,
  SortDirection,
} from "../utils/graphql/graphql.gen.ts";
import { FILTER_PARAM, toFilters, toProduct } from "../utils/transform.ts";

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
}

const filtersFromParams = (searchParams: URLSearchParams) => {
  const mapped = searchParams.getAll(FILTER_PARAM)
    .reduce((acc, value) => {
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
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  // get url from params
  const url = new URL(req.url);
  const { storefront } = ctx;

  const first = props.first ?? 12;
  const filters = filtersFromParams(url.searchParams);
  const sort = url.searchParams.get("sort") as SortValue | null ??
    "DESC:SALES";
  const page = Number(url.searchParams.get("page")) || 0;
  const query = url.searchParams.get("busca");
  const operation = props.operation ?? "AND";
  const [sortDirection, sortKey] = sort.split(":") as [
    SortDirection,
    ProductSortKeys,
  ];

  const data = await storefront.query<SearchQuery, SearchQueryVariables>({
    variables: { query, operation, first, sortDirection, sortKey, filters },
    fragments: [fragment],
    query:
      gql`query Search($operation: Operation!, $query: String, $first: Int!, $sortDirection: SortDirection, $sortKey: ProductSearchSortKeys, $filters: [ProductFilterInput]) { 
        search(query: $query, operation: $operation) { 
          aggregations {
            filters {
              field
              origin
              values {
                quantity
                name
              }
            }
          }
          breadcrumbs {
            link
            text
          }
          forbiddenTerm {
            text
            suggested
          }
          pageSize
          redirectUrl
          searchTime
          products(first: $first, sortDirection: $sortDirection, sortKey: $sortKey, filters: $filters) {
            nodes {
              ...Product
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
            totalCount
          }
        } 
      }`,
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
