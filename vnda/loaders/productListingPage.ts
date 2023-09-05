import type { ProductListingPage } from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
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
  const { cleanUrl, typeTags } = typeTagExtractor(url);
  const sort = url.searchParams.get("sort") as Sort;
  const page = Number(url.searchParams.get("page")) || 1;

  const isSearchPage = url.pathname === "/busca";
  const qQueryString = url.searchParams.get("q");
  const term = props.term || props.slug || qQueryString ||
    undefined;

  const response = await api["GET /api/v2/products/search"]({
    term,
    sort,
    page,
    per_page: count,
    "tags[]": props.tags,
    wildcard: true,
    ...Object.fromEntries(typeTags.map(({ key, value }) => [key, value])),
  }, {
    deco: { cache: "stale-while-revalidate" },
  });
  const pagination = JSON.parse(
    response.headers.get("x-pagination") ?? "null",
  ) as ProductSearchResult["pagination"] | null;

  const categoryTagName = props.term || url.pathname.split("/").pop() || "";
  const [search, seo, categoryTag] = await Promise.all([
    response.json(),
    api["GET /api/v2/seo_data"]({
      resource_type: "Tag",
      code: categoryTagName,
      type: "category",
    }, {
      deco: { cache: "stale-while-revalidate" },
    }).then((res) => res.json()),
    isSearchPage
      ? api["GET /api/v2/tags/:name"]({ name: categoryTagName })
        .then((res) => res.json()).catch(() => undefined)
      : undefined,
  ]);

  const { results: searchResults } = search;
  const products = searchResults.map((product) =>
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

  const hasSEO = !isSearchPage && (seo?.[0] || categoryTag);

  return {
    "@type": "ProductListingPage",
    seo: hasSEO
      ? getSEOFromTag({ ...categoryTag, ...seo?.[0] }, req)
      : undefined,
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: toFilters(search.aggregations, typeTags, cleanUrl),
    products: products,
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
