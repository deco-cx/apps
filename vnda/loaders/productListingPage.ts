import type { ProductListingPage } from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import type { AppContext } from "../mod.ts";
import { ProductSearchResult, Sort } from "../utils/client/types.ts";
import {
  getSEOFromTag,
  toFilters,
  toProduct,
  typeTagExtractor,
} from "../utils/transform.ts";

export const VNDA_SORT_OPTIONS: SortOption[] = [
  { value: "", label: "Relevância" },
  { value: "newest", label: "Mais recentes" },
  { value: "oldest", label: "Mais antigos" },
  { value: "lowest_price", label: "Menor preço" },
  { value: "highest_price", label: "Maior preço" },
];

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;
  /**
   * @description filter products by tag
   */
  tags?: string[];
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;

  /**
   * Slug for category pages
   */
  slug?: RequestURLParam;

  filterByTags?: boolean;
}

/**
 * @title VNDA Integration
 * @description Product Listing Page loader
 */
const searchLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  // get url from params
  const url = new URL(req.url);
  const { api } = ctx;

  const count = props.count ?? 12;
  const sort = url.searchParams.get("sort") as Sort;
  const page = Number(url.searchParams.get("page")) || 1;

  const isSearchPage = url.pathname === "/busca";
  const qQueryString = url.searchParams.get("q");
  const term = props.term || props.slug || qQueryString ||
    undefined;

  const categoryTagName = props.term || url.pathname.split("/").slice(1) || "";

  const categoryTagNames = Object.values(
    Object.fromEntries(new URL(req.url).searchParams.entries()),
  );

  const promises = categoryTagNames.concat(
    [...categoryTagName].filter((isUndefined) =>
      isUndefined !== undefined
    ) as string[],
  ).map((categoryTagName) => {
    return api["GET /api/v2/tags/:name"]({ name: categoryTagName }, STALE)
      .then((res) => res.json())
      .catch(() => undefined);
  });

  const tags = await Promise.all(promises);

  const seoCategories = tags.slice(-[...categoryTagName].length).filter((
    tag,
  ): tag is { name: string; title: string; subtitle: string } =>
    tag !== undefined
  );

  const categories = seoCategories.map(({ name }) => name);

  const resolvedTagNames = tags
    .filter((tag): tag is { name: string } => tag !== undefined)
    .map(({ name }) => name);

  // deno-lint-ignore no-explicit-any
  const filterTagNames: any[] = tags
    .filter((tag) => tag !== undefined);

  const { cleanUrl, typeTags } = typeTagExtractor(
    new URL(req.url),
    filterTagNames,
  );

  const response = await api["GET /api/v2/products/search"]({
    term,
    sort,
    page,
    per_page: count,
    "tags[]": props.tags && props.tags?.length > 0
      ? props.tags
      : (categories.length > 0 && props.filterByTags
        ? [...categories, ...resolvedTagNames]
        : undefined),
    wildcard: true,
    ...Object.fromEntries(typeTags.map(({ key, value }) => [key, value])),
  }, STALE);

  const pagination = JSON.parse(
    response.headers.get("x-pagination") ?? "null",
  ) as ProductSearchResult["pagination"] | null;

  const search = await response.json();

  const { results: searchResults } = search;

  const products = searchResults?.map((product) =>
    toProduct(product, null, {
      url,
      priceCurrency: "BRL",
    })
  );

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (pagination?.next_page) {
    nextPage.set("page", (page + 1).toString());
  }

  if (pagination?.prev_page) {
    previousPage.set("page", (page - 1).toString());
  }

  const hasSEO = !isSearchPage && categories.length > 0;

  return {
    "@type": "ProductListingPage",
    seo: hasSEO
      ? getSEOFromTag({ ...seoCategories[seoCategories.length - 1] }, req)
      : undefined,
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: toFilters(search.aggregations, typeTags, cleanUrl),
    products: products ?? [],
    pageInfo: {
      nextPage: pagination?.next_page ? `?${nextPage}` : undefined,
      previousPage: pagination?.prev_page ? `?${previousPage}` : undefined,
      currentPage: page,
      records: pagination?.total_count,
      recordPerPage: count,
    },
    sortOptions: VNDA_SORT_OPTIONS,
  };
};

export default searchLoader;
