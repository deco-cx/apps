import type {
  BreadcrumbList,
  ProductListingPage,
} from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import type { AppContext } from "../mod.ts";
import { ProductSearchResult, Sort } from "../utils/client/types.ts";
import { Tag } from "../utils/openapi/vnda.openapi.gen.ts";
import {
  canonicalFromTags,
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

type Operators = "and" | "or";

interface FilterOperator {
  type_tags?: Operators;
  property1?: Operators;
  property2?: Operators;
  property3?: Operators;
}

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

  /** @description if properties are empty, "typeTags" value will apply to all. Defaults to "and" */
  filterOperator?: FilterOperator;

  /**
   * @hide true
   * @description The URL of the page, used to override URL from request
   */
  pageHref?: string;
}

const getBreadcrumbList = (categories: Tag[], url: URL): BreadcrumbList => ({
  "@type": "BreadcrumbList" as const,
  itemListElement: categories.map((t, index) => ({
    "@type": "ListItem" as const,
    item: canonicalFromTags(categories.slice(0, index + 1), url).href,
    position: index + 1,
    name: t.title,
  })),
  numberOfItems: categories.length,
});

const handleOperator = (
  key: "type_tags" | "property1" | "property2" | "property3",
  defaultValue: Operators,
  filterOperators?: FilterOperator,
) => ({
  [`${key}_operator`]: filterOperators?.[key] ?? defaultValue ?? "and",
});

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
  const url = new URL(props.pageHref || req.url);
  const { api } = ctx;

  const count = props.count ?? 12;
  const sort = url.searchParams.get("sort") as Sort;
  const page = Number(url.searchParams.get("page")) || 1;

  const isSearchPage = ctx.searchPagePath
    ? ctx.searchPagePath === url.pathname
    : url.pathname === "/busca" || url.pathname === "/s";
  const qQueryString = url.searchParams.get("q");
  const term = props.term || props.slug || qQueryString ||
    undefined;

  const priceFilterRegex = /de-(\d+)-a-(\d+)/;
  const filterMatch = url.href.match(priceFilterRegex) ?? [];

  const categoryTagName = (props.term || url.pathname.slice(1) || "").split(
    "/",
  );

  const properties1 = url.searchParams.getAll("type_tags[property1][]");
  const properties2 = url.searchParams.getAll("type_tags[property2][]");
  const properties3 = url.searchParams.getAll("type_tags[property3][]");

  const categoryTagNames = Array.from(url.searchParams.values());

  const tags = await Promise.all([
    ...categoryTagNames,
    ...categoryTagName.filter((item): item is string =>
      typeof item === "string"
    ),
  ].map((name) =>
    api["GET /api/v2/tags/:name"]({ name }, STALE)
      .then((res) => res.json())
      .catch(() => undefined)
  ));

  const categories = tags
    .slice(-categoryTagName.length)
    .filter((tag): tag is Tag =>
      typeof tag !== "undefined" && typeof tag.name !== "undefined"
    );

  const filteredTags = tags
    .filter((tag): tag is Tag => typeof tag !== "undefined");

  const { cleanUrl, typeTags } = typeTagExtractor(url, filteredTags);

  const initialTags = props.tags && props.tags?.length > 0
    ? props.tags
    : undefined;

  const categoryTagsToFilter = categories.length > 0 && props.filterByTags
    ? categories.map((t) => t.name)
      .filter((name): name is string => typeof name === "string")
    : undefined;

  const defaultOperator = props.filterOperator?.type_tags ?? "and";

  const preference = categoryTagsToFilter
    ? term
    : qQueryString ?? url.pathname.slice(1);

  const tag = categories.at(-1);

  const [response, seo = []] = await Promise.all([
    await api["GET /api/v2/products/search"]({
      term: term ?? preference,
      sort,
      page,
      per_page: count,
      "tags[]": initialTags ?? categoryTagsToFilter,
      wildcard: true,
      ...(filterMatch[1] && { min_price: Number(filterMatch[1]) }),
      ...(filterMatch[2] && { max_price: Number(filterMatch[2]) }),
      "property1_values[]": properties1,
      "property2_values[]": properties2,
      "property3_values[]": properties3,
      ...handleOperator("type_tags", defaultOperator, props.filterOperator),
      ...handleOperator("property1", defaultOperator, props.filterOperator),
      ...handleOperator("property2", defaultOperator, props.filterOperator),
      ...handleOperator("property3", defaultOperator, props.filterOperator),
      ...Object.fromEntries(
        typeTags.reduce<Array<[string, Array<unknown>]>>(
          (acc, { key, value, isProperty }) => {
            if (isProperty) return acc;

            const pos = acc.findIndex((item) => item[0] === key);

            if (pos !== -1) {
              acc[pos] = [key, [...acc[pos][1], value]];
              return acc;
            }

            return [...acc, [key, [value]]];
          },
          [],
        ),
      ),
    }, STALE),
    api["GET /api/v2/seo_data"](
      { resource_type: "Tag", code: tag?.name },
      STALE,
    ).then((res) => res.json())
      .catch(() => undefined),
  ]);

  const pagination = JSON.parse(
    response.headers.get("x-pagination") ?? "null",
  ) as ProductSearchResult["pagination"] | null;

  const search = await response.json();

  const { results: searchResults = [] } = search;

  const validProducts = searchResults.filter(({ variants }) => {
    return variants.length !== 0;
  });

  const products = validProducts.map((product) => {
    return toProduct(product, null, {
      url,
      priceCurrency: "BRL",
    });
  });

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (pagination?.next_page) {
    nextPage.set("page", (page + 1).toString());
  }

  if (pagination?.prev_page) {
    previousPage.set("page", (page - 1).toString());
  }

  return {
    "@type": "ProductListingPage",
    seo: isSearchPage ? undefined : getSEOFromTag(categories, url, seo.at(-1)),
    breadcrumb: isSearchPage
      ? {
        "@type": "BreadcrumbList",
        itemListElement: [],
        numberOfItems: 0,
      }
      : getBreadcrumbList(categories, url),
    filters: toFilters(search.aggregations, typeTags, cleanUrl),
    products,
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
