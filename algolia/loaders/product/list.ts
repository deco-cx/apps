import { SearchResponse } from "npm:@algolia/client-search";
import { Product } from "../../../commerce/types.ts";

import { AppContext } from "../../mod.ts";
import {
  IndexedProduct,
  Indices,
  resolveProducts,
} from "../../utils/product.ts";

interface Props {
  /**
   * @title Count
   * @description Max number of products to return
   */
  hitsPerPage: number;

  /**
   * @title Facets
   * @description Facets to filter by
   */
  facetFilters?: string;

  /** @description Full text search query */
  term?: string;
}

const indexName: Indices = "products";

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const client = await ctx.getClient();

  const { results } = await client.search([{
    indexName,
    query: props.term ?? "",
    params: {
      hitsPerPage: props.hitsPerPage ?? 12,
      facetFilters: JSON.parse(props.facetFilters ?? "[]"),
    },
  }]);

  const { hits: products } = results[0] as SearchResponse<IndexedProduct>;

  return resolveProducts(products, client, req.url);
};

export default loader;
