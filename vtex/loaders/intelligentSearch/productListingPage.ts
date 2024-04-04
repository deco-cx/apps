import type { ProductListingPage } from "../../../commerce/types.ts";
import { parseRange } from "../../../commerce/utils/filters.ts";
import { STALE } from "../../../utils/fetch.ts";
import sendEvent from "../../actions/analytics/sendEvent.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import {
  getValidTypesFromPageTypes,
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
  pageTypesToSeo,
} from "../../utils/legacy.ts";
import {
  getSegmentFromBag,
  isAnonymous,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { slugify } from "../../utils/slugify.ts";
import {
  filtersFromURL,
  mergeFacets,
  parsePageType,
  toFilter,
  toProduct,
} from "../../utils/transform.ts";
import type {
  Facet,
  Fuzzy,
  PageType,
  RangeFacet,
  SelectedFacet,
  Sort,
} from "../../utils/types.ts";
import PLPDefaultPath from "../paths/PLPDefaultPath.ts";
import { redirect } from "deco/mod.ts";

/** this type is more friendly user to fuzzy type that is 0, 1 or auto. */
export type LabelledFuzzy = "automatic" | "disabled" | "enabled";

/**
 * VTEX Intelligent Search doesn't support pagination above 50 pages.
 *
 * We're now showing results for the last page so the page doesn't crash
 */
const VTEX_MAX_PAGES = 50;

const sortOptions = [
  { value: "", label: "relevance:desc" },
  { value: "price:desc", label: "price:desc" },
  { value: "price:asc", label: "price:asc" },
  { value: "orders:desc", label: "orders:desc" },
  { value: "name:desc", label: "name:desc" },
  { value: "name:asc", label: "name:asc" },
  { value: "release:desc", label: "release:desc" },
  { value: "discount:desc", label: "discount:desc" },
];

const LEGACY_TO_IS: Record<string, Sort> = {
  OrderByPriceDESC: "price:desc",
  OrderByPriceASC: "price:asc",
  OrderByTopSaleDESC: "orders:desc",
  OrderByNameDESC: "name:desc",
  OrderByReleaseDateDESC: "release:desc",
  OrderByBestDiscountDESC: "discount:desc",
};

export const mapLabelledFuzzyToFuzzy = (
  labelledFuzzy?: LabelledFuzzy,
): Fuzzy | undefined => {
  switch (labelledFuzzy) {
    case "automatic":
      return "auto";
    case "disabled":
      return "0";
    case "enabled":
      return "1";
    default:
      return;
  }
};

const ALLOWED_PARAMS = new Set([
  "ps",
  "sort",
  "page",
  "o",
  "q",
  "fuzzy",
  "map",
]);

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

  /**
   * @title Sorting
   */
  sort?: Sort;

  /**
   * @title Fuzzy
   */
  fuzzy?: LabelledFuzzy;

  /**
   * @title Selected Facets
   * @description Override selected facets from url
   */
  selectedFacets?: SelectedFacet[];

  /**
   * @title Hide Unavailable Items
   * @description Do not return out of stock items
   */
  hideUnavailableItems?: boolean;

  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;

  /**
   * @title Page query parameter
   */
  page?: number;

  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;

  /**
   * @hide true
   * @description The URL of the page, used to override URL from request
   */
  pageHref?: string;
}

const searchArgsOf = (props: Props, url: URL) => {
  const hideUnavailableItems = props.hideUnavailableItems;
  const countFromSearchParams = url.searchParams.get("PS");
  const count = Number(countFromSearchParams ?? props.count ?? 12);
  const query = props.query ?? url.searchParams.get("q") ?? "";
  const currentPageoffset = props.pageOffset ?? 1;
  const page = props.page ??
    Math.min(
      url.searchParams.get("page")
        ? Number(url.searchParams.get("page")) - currentPageoffset
        : 0,
      VTEX_MAX_PAGES - currentPageoffset,
    );
  const sort = (url.searchParams.get("sort") as Sort) ??
    LEGACY_TO_IS[url.searchParams.get("O") ?? ""] ??
    props.sort ??
    sortOptions[0].value;
  const selectedFacets = mergeFacets(
    props.selectedFacets ?? [],
    filtersFromURL(url),
  );
  const fuzzy = mapLabelledFuzzyToFuzzy(props.fuzzy) ??
    (url.searchParams.get("fuzzy") as Fuzzy);

  return {
    query,
    fuzzy,
    page,
    sort,
    count,
    hideUnavailableItems,
    selectedFacets,
  };
};

const PAGE_TYPE_TO_MAP_PARAM = {
  Brand: "brand",
  Collection: "productClusterIds",
  Cluster: "productClusterIds",
  Search: null,
  Product: null,
  NotFound: null,
  FullText: null,
};

const pageTypeToMapParam = (type: PageType["pageType"], index: number) => {
  if (type === "Category" || type === "Department" || type === "SubCategory") {
    return `category-${index + 1}`;
  }

  return PAGE_TYPE_TO_MAP_PARAM[type];
};

const queryFromPathname = (
  isInSeachFormat: boolean,
  pageTypes: PageType[],
  path: string,
) => {
  const pathList = path.split("/").slice(1);

  const isPage = Boolean(pageTypes.length);
  const isValidPathSearch = pathList.length == 1;

  if (!isPage && !isInSeachFormat && isValidPathSearch) {
    // decode uri parse uri enconde symbols like '%20' to ' '
    return decodeURI(pathList[0]);
  }
};

const filtersFromPathname = (pages: PageType[]) =>
  pages
    .map((page, index) => {
      const key = pageTypeToMapParam(page.pageType, index);

      if (!key || !page.name) {
        return;
      }

      return (
        key &&
        page.name && {
          key,
          value: slugify(page.name),
        }
      );
    })
    .filter((facet): facet is { key: string; value: string } => Boolean(facet));

// Search API does not return the selected price filter, so there is no way for the
// user to remove this price filter after it is set. This function selects the facet
// so users can clear the price filters
const selectPriceFacet = (facets: Facet[], selectedFacets: SelectedFacet[]) => {
  const price = facets.find((f): f is RangeFacet => f.key === "price");
  const ranges = selectedFacets
    .filter((k) => k.key === "price")
    .map((s) => parseRange(s.value))
    .filter(Boolean);

  if (price) {
    for (const range of ranges) {
      if (!range) continue;

      for (const val of price.values) {
        if (val.range.from === range.from && val.range.to === range.to) {
          val.selected = true;
        }
      }
    }
  }

  return facets;
};

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(props.pageHref || baseUrl);
  const segment = getSegmentFromBag(ctx);
  const currentPageoffset = props.pageOffset ?? 1;
  const {
    selectedFacets: baseSelectedFacets,
    page,
    ...args
  } = searchArgsOf(props, url);

  let pathToUse = url.pathname;

  if (pathToUse === "/" || pathToUse === "/*") {
    const result = await PLPDefaultPath({ level: 1 }, req, ctx);
    pathToUse = result?.possiblePaths[0] ?? pathToUse;
  }

  const pageTypesPromise = pageTypesFromPathname(pathToUse, ctx);
  const allPageTypes = await pageTypesPromise;

  const pageTypes = getValidTypesFromPageTypes(allPageTypes);

  const selectedFacets = baseSelectedFacets.length === 0
    ? filtersFromPathname(pageTypes)
    : baseSelectedFacets;

  const selected = withDefaultFacets(selectedFacets, ctx);
  const fselected = selected.filter((f) => f.key !== "price");

  const isInSeachFormat = Boolean(selected.length) || Boolean(args.query);

  const pathQuery = queryFromPathname(isInSeachFormat, pageTypes, url.pathname);

  const searchArgs = { ...args, query: args.query || pathQuery };

  if (!isInSeachFormat && !pathQuery) {
    return null;
  }

  const params = withDefaultParams({ ...searchArgs, page });

  // search products on VTEX. Feel free to change any of these parameters
  const [productsResult, facetsResult] = await Promise.all([
    vcsDeprecated[
      "GET /api/io/_v/api/intelligent-search/product_search/*facets"
    ](
      {
        ...params,
        facets: toPath(selected),
      },
      { ...STALE, headers: segment ? withSegmentCookie(segment) : undefined },
    ).then((res) => res.json()),
    vcsDeprecated["GET /api/io/_v/api/intelligent-search/facets/*facets"](
      {
        ...params,
        facets: toPath(fselected),
      },
      { ...STALE, headers: segment ? withSegmentCookie(segment) : undefined },
    ).then((res) => res.json()),
  ]);

  // It is a feature from Intelligent Search on VTEX panel
  // redirect to a specific page based on configured rules
  if (productsResult.redirect) {
    redirect(
      new URL(productsResult.redirect, url.origin)
        .href,
    );
  }

  /** Intelligent search API analytics. Fire and forget 🔫 */
  const fullTextTerm = params["query"];
  if (fullTextTerm) {
    sendEvent({ type: "session.ping", url: url.href }, req, ctx)
      .then(() =>
        sendEvent(
          {
            type: "search.query",
            text: fullTextTerm,
            misspelled: productsResult.correction?.misspelled ?? false,
            match: productsResult.recordsFiltered,
            operator: productsResult.operator,
            locale: segment?.payload?.cultureInfo ?? "pt-BR",
            url: url.href,
          },
          req,
          ctx,
        )
      )
      .catch(console.error);
  }

  const {
    products: vtexProducts,
    pagination,
    recordsFiltered,
  } = productsResult;
  const facets = selectPriceFacet(facetsResult.facets, selectedFacets);

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = await Promise.all(
    vtexProducts
      .map((p) =>
        toProduct(p, p.items[0], 0, {
          baseUrl: baseUrl,
          priceCurrency: segment?.payload?.currencyCode ?? "BRL",
        })
      )
      .map((product) =>
        props.similars ? withIsSimilarTo(req, ctx, product) : product
      ),
  );

  const paramsToPersist = new URLSearchParams();
  searchArgs.query && paramsToPersist.set("q", searchArgs.query);
  searchArgs.sort && paramsToPersist.set("sort", searchArgs.sort);
  const filters = facets
    .filter((f) => !f.hidden)
    .map(toFilter(selectedFacets, paramsToPersist));

  const itemListElement = pageTypesToBreadcrumbList(pageTypes, baseUrl);

  const hasNextPage = Boolean(pagination.next.proxyUrl);
  const hasPreviousPage = page > 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + currentPageoffset + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page + currentPageoffset - 1).toString());
  }

  const currentPage = page + currentPageoffset;

  return {
    "@type": "ProductListingPage",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    filters,
    products,
    pageInfo: {
      nextPage: hasNextPage ? `?${nextPage}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage,
      records: recordsFiltered,
      recordPerPage: pagination.perPage,
      pageTypes: allPageTypes.map(parsePageType),
    },
    sortOptions,
    seo: pageTypesToSeo(
      pageTypes,
      baseUrl,
      hasPreviousPage ? currentPage : undefined,
    ),
  };
};

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const { token } = getSegmentFromBag(ctx);
  const url = new URL(req.url);
  if (url.searchParams.has("q") || !isAnonymous(ctx)) {
    return null;
  }

  const params = new URLSearchParams([
    ["query", props.query ?? ""],
    ["count", props.count.toString()],
    ["page", (props.page ?? 1).toString()],
    ["sort", props.sort ?? ""],
    ["fuzzy", props.fuzzy ?? ""],
    ["hideUnavailableItems", props.hideUnavailableItems?.toString() ?? ""],
    ["pageOffset", (props.pageOffset ?? 1).toString()],
  ]);

  url.searchParams.forEach((value, key) => {
    if (!ALLOWED_PARAMS.has(key.toLowerCase()) && !key.startsWith("filter.")) {
      return;
    }

    params.append(key, value);
  });

  params.sort();
  params.set("segment", token);

  url.search = params.toString();

  return url.href;
};

export default loader;
