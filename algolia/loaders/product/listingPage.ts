import { SearchResponse } from "npm:@algolia/client-search";
import { Filter, ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { replaceHighlight } from "../../utils/highlight.ts";
import {
  IndexedProduct,
  Indices,
  resolveProducts,
} from "../../utils/product.ts";

/** @titleBy label */
interface Facet {
  /**
   * @title Facet Name
   * @description These are the facet names available at Algolia dashboard > search > index */
  name: string;

  /** @description Facet label to be rendered on the site UI */
  label: string;
}

interface Props {
  /**
   * @title Count
   * @description Max number of products to return
   */
  hitsPerPage: number;

  /**
   * @title Facets
   * @description List of facet names from Product to render on the website
   */
  facets?: Facet[];

  /**
   * @description https://www.algolia.com/doc/api-reference/api-parameters/sortFacetValuesBy/
   */
  sortFacetValuesBy?: "count" | "alpha";

  /** @description Full text search query */
  term?: string;

  /** @description Enable to highlight matched terms */
  highlight?: boolean;

  /** @description Hide Unavailable Items */
  hideUnavailable?: boolean;

  /**
   * @description ?page search params for the first page
   * @default 0
   */
  startingPage?: 0 | 1;
}

const getPageInfo = (
  page: number,
  nbPages: number,
  nbHits: number,
  hitsPerPage: number,
  url: URL,
  startingPage: number,
) => {
  const next = page + 1;
  const prev = page - 1;
  const hasNextPage = next < nbPages;
  const hasPreviousPage = prev >= 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", `${next + startingPage}`);
  }

  if (hasPreviousPage) {
    previousPage.set("page", `${prev + startingPage}`);
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
    records: nbHits,
    recordPerPage: hitsPerPage,
    currentPage: page + startingPage,
  };
};

// Transforms facets and re-orders so they match what's configured on deco admin
const transformFacets = (
  facets: Record<string, Record<string, number>>,
  options: { order: Facet[]; facetFilters: [string, string[]][]; url: URL },
): Filter[] => {
  const { facetFilters, url, order } = options;
  const params = new URLSearchParams(url.searchParams);
  const filters = Object.fromEntries(facetFilters);
  const orderByKey = new Map(
    order.map(({ name, label }, index) => [name, { label, index }]),
  );
  const entries = Object.entries(facets);

  const transformed: Filter[] = new Array(entries.length);
  for (let it = 0; it < entries.length; it++) {
    const [key, values] = entries[it];
    const filter = filters[key] ?? [];
    let index: number | undefined = it;
    let label: string | undefined = key;

    // Apply sort only when user set facets on deco admin
    if (orderByKey.size > 0) {
      index = orderByKey.get(key)?.index;
      label = orderByKey.get(key)?.label;
    }

    if (index === undefined || label === undefined) continue;

    transformed[index] = {
      "@type": "FilterToggle",
      quantity: 0,
      label,
      key,
      values: Object.entries(values).map(([value, quantity]) => {
        const index = filter.findIndex((f) => f === value);
        const selected = index > -1;
        const newFilter = selected
          ? {
            ...filters,
            [key]: [...filter].filter((f) => f !== value),
          }
          : {
            ...filters,
            [key]: [...filter, value],
          };

        if (newFilter[key].length === 0) {
          delete newFilter[key];
        }

        params.set("facetFilters", JSON.stringify(Object.entries(newFilter)));

        return {
          value,
          quantity,
          label: value,
          selected,
          url: `?${params}`,
        };
      }),
    };
  }

  return transformed.filter(Boolean);
};

const getIndex = (options: string | null): Indices => {
  switch (options) {
    case "relevance":
      return "products";
    case "price_asc":
      return "products_price_asc";
    case "price_desc":
      return "products_price_desc";
    default:
      return "products";
  }
};

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { client } = ctx;
  const indexName = getIndex(url.searchParams.get("sort"));
  const startingPage = props.startingPage ?? 0;
  const pageIndex = Number(url.searchParams.get("page")) || startingPage;

  const facetFilters: [string, string[]][] = JSON.parse(
    url.searchParams.get("facetFilters") ?? "[]",
  );

  if (props.hideUnavailable) {
    facetFilters.push(["available", ["true"]]);
  }

  // Creates a canonical facet representation format
  // Facets on the same category are grouped by OR and facets on
  // different categories are split by an AND. e.g.:
  //
  // (department:"man" OR department:"woman") AND (brand:"deco") AND (available:"true")
  const fFilters = facetFilters.map(([key, values]) =>
    `(${values.map((value) => `${key}:"${value}"`).join(" OR ")})`
  ).join(" AND ");

  const { results } = await client.search([
    {
      indexName,
      query: props.term ?? url.searchParams.get("q") ??
        url.searchParams.get("query") ?? "",
      params: {
        filters: fFilters,
        facets: [],
        hitsPerPage: props.hitsPerPage ?? 12,
        page: pageIndex - startingPage,
        clickAnalytics: true,
      },
    },
    {
      indexName,
      query: props.term ?? url.searchParams.get("q") ??
        url.searchParams.get("query") ?? "",
      params: {
        facetingAfterDistinct: true,
        facets: (props.facets?.length || 0) > 0
          ? props.facets?.map((f) => f.name)
          : ["*"],
        hitsPerPage: 0,
        sortFacetValuesBy: props.sortFacetValuesBy,
      },
    },
  ]);

  const [
    { hits, page, nbPages, queryID, nbHits, hitsPerPage },
    { facets },
  ] = results as SearchResponse<IndexedProduct>[];

  const products = await resolveProducts(
    hits.map(({ _highlightResult, ...p }) =>
      replaceHighlight(p, props.highlight ? _highlightResult : {})
    ),
    client,
    { url, queryID, indexName },
  );
  const pageInfo = getPageInfo(
    page,
    nbPages,
    nbHits,
    hitsPerPage,
    url,
    startingPage,
  );
  const filters = transformFacets(facets ?? {}, {
    order: props.facets ?? [],
    facetFilters,
    url,
  });

  return {
    "@type": "ProductListingPage",
    // TODO: Find out what's the right breadcrumb on algolia
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters,
    products,
    pageInfo,
    sortOptions: [
      {
        value: "relevance",
        label: "Relevance",
      },
      {
        value: "price_asc",
        label: "Price - Lower to Higher",
      },
      {
        value: "price_desc",
        label: "Price - Higher to Lower",
      },
    ],
  };
};

export default loader;
