import type { SearchResponse } from "npm:@algolia/client-search";
import { Suggestion } from "../../../commerce/types.ts";
import type { AppContext } from "../../mod.ts";
import {
  Indices,
} from "../../utils/product.ts";
import { toProduct } from "../../utils/vnda.ts";
import { VNDAProduct } from "../../utils/types.ts"

interface Props {
  query?: string;

  /** @description number of suggested terms/products to return */
  count?: number;

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
  { query, count, hideUnavailable }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { client } = ctx;
  const url = new URL(req.url)
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
    { hits: indexedProducts },
  ] = results as [
    SearchResponse<IndexedSuggestion>,
    SearchResponse<VNDAProduct>,
  ];

  const searches = suggestions.map((s) => ({
    term: s.query,
    hits: s.products.exact_nb_hits,
    facets: [
      ...toFacets(s.products.facets.exact_matches),
      ...toFacets(s.products.facets.analytics),
    ].filter(Boolean),
  }));

  const products = indexedProducts.map((product) => {
    return toProduct(product, {
      url,
      priceCurrency: "BRL",
    });
  });

  return {
    searches,
    products,
  };
};

export default loader;
