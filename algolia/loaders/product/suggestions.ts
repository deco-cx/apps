import type { SearchResponse } from "npm:@algolia/client-search";
import { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import { replaceHighlight } from "../../utils/highlight.ts";
import {
  type IndexedProduct,
  Indices,
  resolveProducts,
} from "../../utils/product.ts";

interface Props {
  query?: string;

  /** @description number of suggested terms/products to return */
  count?: number;

  /** @description Enable to highlight matched terms */
  highlight?: boolean;

  /** @description Hide Unavailable Items */
  hideUnavailable?: boolean;
}

interface IndexedSuggestion {
  nb_words: number;
  popularity: number;
  products: {
    exact_nb_hits: number;
    facets: {
      exact_matches: Record<string, { value: string; count: number }[]>;
      analytics: Record<string, { value: string; count: number }[]>;
    };
  };
  query: string;
}

const toFacets = (
  facets: IndexedSuggestion["products"]["facets"]["exact_matches"],
) =>
  Object.entries(facets).map(([key, values]) => ({
    values: values.map((v) => v.value),
    key,
  }));

const productsIndex = "products" satisfies Indices;

/**
 * @title Algolia Integration
 */
const loader = async (
  { query, count, highlight, hideUnavailable }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { client } = ctx;

  const { results } = await client.search([
    {
      indexName: "products_query_suggestions" satisfies Indices,
      params: { hitsPerPage: count ?? 0 },
      query,
    },
    {
      indexName: productsIndex,
      params: {
        hitsPerPage: count ?? 0,
        filters: hideUnavailable ? `available:true` : "",
        facets: [],
        clickAnalytics: true,
      },
      query,
    },
  ]);

  const [
    { hits: suggestions },
    { hits: indexedProducts, queryID },
  ] = results as [
    SearchResponse<IndexedSuggestion>,
    SearchResponse<IndexedProduct>,
  ];

  const products = await resolveProducts(
    indexedProducts.map(({ _highlightResult, ...p }) =>
      replaceHighlight(p, highlight ? _highlightResult : {})
    ),
    client,
    { url: req.url, queryID, indexName: productsIndex },
  );

  const searches = suggestions.map((s) => ({
    term: s.query,
    hits: s.products.exact_nb_hits,
    facets: [
      ...toFacets(s.products.facets.exact_matches),
      ...toFacets(s.products.facets.analytics),
    ].filter(Boolean),
  }));

  return {
    searches: searches,
    products,
  };
};

export default loader;
