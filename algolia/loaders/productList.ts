import { Product } from "../../commerce/types.ts";

import { AppContext } from "../mod.ts";
import { IndexedProduct, resolveProducts } from "../utils/product.ts";

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

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { algolia } = ctx;
  const index = await algolia("products");

  const { hits: products } = await index.search<IndexedProduct>(
    props.term ?? "",
    {
      hitsPerPage: props.hitsPerPage ?? 12,
      facetFilters: JSON.parse(props.facetFilters ?? "[]"),
    },
  );

  return resolveProducts(products, index);
};

export default loader;
