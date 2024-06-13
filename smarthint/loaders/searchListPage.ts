import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";

export type SearchSort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RuleType = "valuedouble" | "valuedate" | "valuestring";

export interface Filter {
  field: string;
  value: string;
}

export interface Props {
  /**
   * @hide
   */
  term?: string;
  /**
   * @description Number of products that must be returned per page
   */
  size: number;
  /**
   * @hide
   */
  searchSort?: SearchSort;
  /**
   * @hide
   */
  filter?: Filter[];
  /**
   * @hide
   */
  from?: number;
  /**
   * @hide
   */
  rule?: string;
  /**
   * @hide
   */
  ruletype?: RuleType;
  /**
   * @hide
   */
  condition?: {
    field?: string;
    value?: string;
    validation?: string;
  };
}

/**
 * @title Smarthint Search
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;
  const {
    term: termProp,
    condition,
    filter = [],
    from: fromParam,
    rule,
    searchSort,
    size,
    ruletype,
  } = props;

  const url = new URL(req.url);
  const anonymous = getSessionCookie(req.headers);

  const sort = url.searchParams.get("sort") ??
    url.searchParams.get("searchSort") ?? searchSort;

  const filters = url.searchParams.getAll("filter").length
    ? url.searchParams.getAll("filter")
    : filter.length
    ? filter.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
    : undefined;

  const conditionString = condition
    ? `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`
    : undefined;

  const page = Number(url.searchParams.get("page") ?? 1);

  const from = fromParam ?? page <= 1 ? 0 : (page - 1) * size;

  const term = termProp ?? url.searchParams.get("busca") ??
    url.searchParams.get("q");

  if (!term) return null;

  const data = await api["GET /:cluster/Search/GetPrimarySearch"]({
    cluster,
    shcode,
    anonymous,
    term,
    size: String(size),
    searchSort: String(sort),
    ruletype,
    rule,
    from: String(from),
    filter: filters,
    condition: conditionString,
  }).then((r) => r.json());

  if (data?.IsRedirect) {
    redirect(
      new URL(data?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products = data?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data?.Sorts ?? []);

  const pageFilters = toFilters(data?.Filters ?? [], url);

  const hasNextPage = (data?.TotalResult ?? 0) > size;
  const hasPreviousPage = from > 0 && (data?.TotalResult ?? 0) > size;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  console.log({ page, from });

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    "@type": "ProductListingPage",
    products: products,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    sortOptions,
    filters: pageFilters,
    pageInfo: {
      records: data?.TotalResult,
      recordPerPage: size,
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage: page,
      pageTypes: [
        "Search",
      ],
    },
  };
};

export default loader;
