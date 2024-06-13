import { STALE } from "../../../utils/fetch.ts";
import type { AppContext } from "../../mod.ts";
import {
  Facet,
  FieldsList,
  ProductListResponse,
  Sort,
} from "../../utils/client/types.ts";

export interface Props {
  /** @description The category ID. */
  categoryId: string;
  /**
   * @description The current result page requested.
   *  @default 0
   */
  currentPage?: number;
  /** @description The selected facets used in the search. */
  facets: Facet[];
  /**
   * @description Response configuration. This is the list of fields that should be returned in the response body. Examples: BASIC, DEFAULT, FULL
   *  @default DEFAULT
   */
  fields?: FieldsList;
  /** @description The number of results returned per page. */
  pageSize?: number;
  /**
   * @description Sorting method applied to the return results.
   *  @default relevance
   */
  sort?: Sort;
}

/**
 * @title SAP Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<ProductListResponse> => {
  const { api } = ctx;
  const { categoryId, currentPage, facets, fields, pageSize, sort } = props;

  const facetsQuery = facets
    .reduce(
      (prev, curr) => [...prev, `${curr.key}:${curr.value}`],
      [] as string[]
    )
    .join(":");

  const query = `:${sort}:${facetsQuery}`;

  const data: ProductListResponse = await api[
    "GET /categories/:categoryId/products"
  ]({ categoryId, currentPage, fields, pageSize, query }, STALE).then((res) =>
    res.json()
  );

  return data;
};

export default productListLoader;
