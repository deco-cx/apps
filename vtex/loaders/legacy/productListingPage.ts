import type { Filter, ProductListingPage } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { AppContext } from "../../mod.ts";
import {
  getMapAndTerm,
  pageTypesFromPathname,
  pageTypesToBreadcrumbList,
  pageTypesToSeo,
  toSegmentParams,
} from "../../utils/legacy.ts";
import { getSegment, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { legacyFacetToFilter, toProduct } from "../../utils/transform.ts";
import type {
  LegacyFacet,
  LegacyProduct,
  LegacySort,
  PageType,
} from "../../utils/types.ts";

const MAX_ALLOWED_PAGES = 500;

export interface Props {
  /**
   * @description overides the query term
   */
  term?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
  /**
   * @description FullText term
   * @$comment https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search
   */
  ft?: string;
  /**
   * @$comment https://developers.vtex.com/docs/api-reference/search-api#get-/api/catalog_system/pub/products/search
   */
  fq?: string;
  /**
   * @description map param
   */
  map?: string;
  /**
   * @title Sorting
   */
  sort?: LegacySort;

  /**
   * @title Filter behavior
   * @description Set to static to not change the facets when the user filters the search. Dynamic will only show the filters containing products after each filter action
   */
  filters?: "dynamic" | "static";

  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;

  /**
   * @description Include similar products
   */
  similars?: boolean;
}

export const sortOptions = [
  { label: "price:desc", value: "OrderByPriceDESC" },
  { label: "price:asc", value: "OrderByPriceASC" },
  { label: "orders:desc", value: "OrderByTopSaleDESC" },
  { label: "name:desc", value: "OrderByNameDESC" },
  { label: "name:asc", value: "OrderByNameASC" },
  { label: "release:desc", value: "OrderByReleaseDateDESC" },
  { label: "discount:desc", value: "OrderByBestDiscountDESC" },
  { label: "relevance:desc", value: "OrderByScoreDESC" },
];

const IS_TO_LEGACY: Record<string, LegacySort> = {
  "price:desc": "OrderByPriceDESC",
  "price:asc": "OrderByPriceASC",
  "orders:desc": "OrderByTopSaleDESC",
  "name:desc": "OrderByNameDESC",
  "release:desc": "OrderByReleaseDateDESC",
  "discount:desc": "OrderByBestDiscountDESC",
  "relevance:desc": "OrderByScoreDESC",
};

export const removeForwardSlash = (str: string) =>
  str.slice(str.startsWith("/") ? 1 : 0);

const getTerm = (path: string, map: string) => {
  const mapSegments = map.split(",");
  const pathSegments = removeForwardSlash(path).split("/");

  return pathSegments.slice(0, mapSegments.length).join("/");
};

/**
 *  verify if when url its not a category/department/collection
 *  and is not a default query format but is a valid search based in default lagacy behavior on native stores
 */
const getTermFallback = (url: URL, pageTypes: PageType[], fq: string[]) => {
  const pathList = url.pathname.split("/").slice(1);

  /**
   * in lagacy mutiple terms path like /foo/bar is a valid search but any term after first will be ignored
   * so this verify limit the term falback only if has one term
   * if this is a problem feel free to remove the last verification
   */
  const isOneTermOnly = pathList.length == 1;

  if (!pageTypes.length && !fq.length && isOneTermOnly) {
    return pathList[0];
  }

  return "";
};

/**
 * @title VTEX Integration - Legacy Search
 * @description Product Listing Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { vcsDeprecated } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);
  const segment = getSegment(ctx);
  const params = toSegmentParams(segment);
  const currentPageoffset = props.pageOffset ?? 1;

  const filtersBehavior = props.filters || "dynamic";
  const count = props.count ?? 12;
  const maybeMap = props.map || url.searchParams.get("map") || undefined;
  const maybeTerm = props.term || url.pathname || "";

  const page = url.searchParams.get("page")
    ? Number(url.searchParams.get("page")) - currentPageoffset
    : 0;
  const O = (url.searchParams.get("O") as LegacySort) ??
    IS_TO_LEGACY[url.searchParams.get("sort") ?? ""] ??
    props.sort ??
    sortOptions[0].value;
  const fq = props.fq ? [props.fq] : url.searchParams.getAll("fq");
  const _from = page * count;
  const _to = (page + 1) * count - 1;

  const pageTypes = await pageTypesFromPathname(maybeTerm, ctx);
  const pageType = pageTypes.at(-1) || pageTypes[0];

  const ftFallback = getTermFallback(url, pageTypes, fq);

  const ft = props.ft ||
    url.searchParams.get("ft") ||
    url.searchParams.get("q") ||
    ftFallback;

  if (pageTypes.length === 0 && !ft && !fq.length) {
    return null;
  }

  const missingParams = typeof maybeMap !== "string" || !maybeTerm;
  const [map, term] = missingParams
    ? getMapAndTerm(pageTypes)
    : [maybeMap, maybeTerm];

  const fmap = url.searchParams.get("fmap") ?? map;
  const args = { map, _from, _to, O, ft, fq };

  const [vtexProductsResponse, vtexFacets] = await Promise.all([
    vcsDeprecated["GET /api/catalog_system/pub/products/search/:term?"](
      {
        ...params,
        ...args,
        term: getTerm(term, map),
      },
      { ...STALE, headers: withSegmentCookie(segment) },
    ),
    vcsDeprecated["GET /api/catalog_system/pub/facets/search/:term"](
      {
        ...params,
        ...args,
        term: getTerm(term, fmap),
        map: fmap,
      },
      STALE,
    ).then((res) => res.json()),
  ]);

  const vtexProducts = (await vtexProductsResponse.json()) as LegacyProduct[];
  const resources = vtexProductsResponse.headers.get("resources") ?? "";
  const [, _total] = resources.split("/");

  // Transform VTEX product format into schema.org's compatible format
  // If a property is missing from the final `products` array you can add
  // it in here
  const products = await Promise.all(
    vtexProducts
      .map((p) =>
        toProduct(p, p.items[0], 0, {
          baseUrl,
          priceCurrency: "BRL", // config!.defaultPriceCurrency, // TODO: fix currency
        })
      )
      .map((product) =>
        props.similars ? withIsSimilarTo(req, ctx, product) : product
      ),
  );

  // Get categories of the current department/category
  const getCategoryFacets = (CategoriesTrees: LegacyFacet[]): LegacyFacet[] => {
    const isDepartmentOrCategoryPage = !pageType;
    if (isDepartmentOrCategoryPage) {
      return [];
    }

    for (const category of CategoriesTrees) {
      const isCurrentCategory = category.Id == Number(pageType.id);
      if (isCurrentCategory) {
        return category.Children || [];
      } else if (category.Children.length) {
        const childFacets = getCategoryFacets(category.Children);
        const hasChildFacets = childFacets.length;
        if (hasChildFacets) {
          return childFacets;
        }
      }
    }

    return [];
  };

  const filters = Object.entries({
    Departments: vtexFacets.Departments,
    Categories: getCategoryFacets(vtexFacets.CategoriesTrees),
    Brands: vtexFacets.Brands,
    ...vtexFacets.SpecificationFilters,
    PriceRanges: vtexFacets.PriceRanges,
  })
    .map(([name, facets]) =>
      legacyFacetToFilter(name, facets, url, map, filtersBehavior)
    )
    .flat()
    .filter((x): x is Filter => Boolean(x));
  const itemListElement = pageTypesToBreadcrumbList(pageTypes, baseUrl);

  const hasMoreResources = _to < parseInt(_total, 10) - 1;

  const hasNextPage = Boolean(page < MAX_ALLOWED_PAGES && hasMoreResources);

  const hasPreviousPage = page > 0;

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", (page + currentPageoffset + 1).toString());
  }

  if (hasPreviousPage) {
    previousPage.set("page", (page + currentPageoffset - 1).toString());
  }

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
      nextPage: hasNextPage ? `?${nextPage.toString()}` : undefined,
      previousPage: hasPreviousPage ? `?${previousPage.toString()}` : undefined,
      currentPage: page + currentPageoffset,
      records: parseInt(_total, 10),
      recordPerPage: count,
    },
    sortOptions,
    seo: pageTypesToSeo(pageTypes, req),
  };
};

export default loader;
