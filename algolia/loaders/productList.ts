import { Product } from "../../commerce/types.ts";

import { AppContext } from "../mod.tsx";
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
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { clientForIndex } = ctx;
  const index = await clientForIndex("products");

  const { hits: products } = await index.search<IndexedProduct>(
    props.term ?? "",
    {
      hitsPerPage: props.hitsPerPage ?? 12,
      facetFilters: JSON.parse(props.facetFilters ?? "[]"),
    },
  );

  return resolveProducts(products, index, req.url);
};

export default loader;
