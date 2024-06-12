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

  indexName?: string;

  objectIds?: string[];
}

const INDEX_NAME: Indices = "products";

type ProductMap = Record<string, Product>;

function sortProducts(products: Product[], objectIds: string[]) {
  const productMap: ProductMap = {};

  products.forEach((product) => {
    productMap[product.productID] = product;
  });

  return objectIds.map((id) => productMap[id]);
}

/**
 * @title Algolia Integration
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { client } = ctx;
  const { indexName = INDEX_NAME, objectIds } = props;

  const objectIdsArray = objectIds?.map((id) => `objectID:${id}`) ?? [];

  const { results } = await client.search([{
    indexName,
    query: props.term ?? "",
    params: {
      hitsPerPage: props.hitsPerPage ?? 12,
      facetFilters: [...JSON.parse(props.facetFilters ?? "[]"), [
        ...objectIdsArray,
      ]],
      clickAnalytics: true,
    },
  }]);

  const { hits: products, queryID } = results[0] as SearchResponse<
    IndexedProduct
  >;

  const transformedProducts = await resolveProducts(products, client, {
    url: req.url,
    queryID,
    indexName,
  });

  const newProductsSorted = (objectIds && objectIds?.length > 0)
    ? sortProducts(transformedProducts, objectIds)
    : transformedProducts;

  return newProductsSorted;
};

export default loader;
