import { SearchResponse } from "npm:@algolia/client-search";
import { AppContext } from "../../mod.ts";
import type { AlgoliaProduct, AlgoliaV2 } from "../../utils/types.ts";

/** @titleBy label */
interface Facet {
  /**
   * @title Facet Name
   * @description These are the facet names available at Algolia dashboard > search > index */
  name: string;

  /** @description Facet label to be rendered on the site UI */
  label: string;
}

/** @titleBy name */
export type IndexOption = {
  /** @description The indexName on Algolia  */
  name: string;
  /** @description Label to be rendered on the site's url  */
  label: string;
};

export interface Props {
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

  /**
   * @description This field is for the developer set up. You can find it on index names at Algolia.
   */
  indexes?: IndexOption[];
}

const getIndex = (options: IndexOption[], option: string | null): string =>
  (options.find(({ label }) => label === option) ?? { name: "products" })
    ?.name;

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<AlgoliaV2> => {
  const url = new URL(req.url);
  const { client } = ctx;
  const defaultIndexes = [{ label: "relevance", name: "products" }, {
    label: "price_asc",
    name: "products_price_asc",
  }, { label: "price_desc", name: "products_price_desc" }];
  const indexName = getIndex(
    props.indexes ?? defaultIndexes,
    url.searchParams.get("sort"),
  );
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

  return {
    results: results as SearchResponse<AlgoliaProduct>[],
    facetFilters,
    startingPage,
    props,
  };
};

export default loader;
