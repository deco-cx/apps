import { SearchResponse } from "npm:@algolia/client-search";
import { Filter, ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { replaceHighlight } from "../../utils/highlight.ts";
import {
  IndexedProduct,
  Indices,
  resolveProducts,
} from "../../utils/product.ts";

/** @titleBy name */
interface Facet {
  name: string;
  /** @description Select if the facet is a ProductGroup facet */
  groupFacet?: boolean;
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
}

const getPageInfo = (page: number, nbPages: number, url: URL) => {
  const next = page + 1;
  const prev = page - 1;
  const hasNextPage = next < nbPages;
  const hasPreviousPage = prev >= 0;
  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  if (hasNextPage) {
    nextPage.set("page", `${next}`);
  }

  if (hasPreviousPage) {
    previousPage.set("page", `${prev}`);
  }

  return {
    nextPage: hasNextPage ? `?${nextPage}` : undefined,
    previousPage: hasPreviousPage ? `?${previousPage}` : undefined,
    currentPage: page,
  };
};

const facet = {
  scope: ({ name, groupFacet }: Facet) =>
    `${groupFacet ? "groupFacets." : "facets."}${name}`,
  unscope: (facet: string) =>
    facet.replace("groupFacets.", "").replace("facets.", ""),
};

const transformFacets = (
  facets: Record<string, Record<string, number>> = {},
  options: { facetFilters: [string, string[]][]; url: URL },
): Filter[] => {
  const { facetFilters, url } = options;
  const params = new URLSearchParams(url.searchParams);
  const filters = Object.fromEntries(facetFilters);

  return Object.entries(facets).map(([key, values]) => {
    const filter = filters[key] ?? [];

    return {
      "@type": "FilterToggle",
      quantity: 0,
      label: facet.unscope(key),
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
  });
};

const sortFacets = (filters: Filter[], order?: Facet[]) => {
  if (!order || order.length === 0) {
    return filters;
  }

  return order
    .map((o) => filters.find((f) => f.key === facet.scope(o)))
    .filter((f): f is Filter => Boolean(f));
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
  const client = await ctx.getClient();
  const indexName = getIndex(url.searchParams.get("sort"));

  const facetFilters: [string, string[]][] = JSON.parse(
    url.searchParams.get("facetFilters") ?? "[]",
  );

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
        page: Number(url.searchParams.get("page")) || 0,
      },
    },
    {
      indexName,
      query: props.term ?? url.searchParams.get("q") ??
        url.searchParams.get("query") ?? "",
      params: {
        facetingAfterDistinct: true,
        facets: (props.facets?.length || 0) > 0
          ? props.facets?.map(facet.scope)
          : ["*"],
        hitsPerPage: 0,
        sortFacetValuesBy: props.sortFacetValuesBy,
      },
    },
  ]);

  const [{ hits, page, nbPages }, { facets }] = results as SearchResponse<
    IndexedProduct
  >[];

  const products = await resolveProducts(
    hits.map(({ _highlightResult, ...p }) =>
      replaceHighlight(p, props.highlight ? _highlightResult : {})
    ),
    client,
    url,
  );
  const pageInfo = getPageInfo(page, nbPages, url);
  const filters = transformFacets(facets, { facetFilters, url });

  return {
    "@type": "ProductListingPage",
    // TODO: Find out what's the right breadcrumb on algolia
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: sortFacets(filters, props.facets),
    products: products,
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
