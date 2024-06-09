import { STALE } from "../../utils/fetch.ts";
import type { AppContext } from "../mod.ts";
import {
  Facet,
  FieldsList,
  Product,
  SearchResponse,
  Sort,
} from "../utils/client/types.ts";

export interface Props {
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
  /** @description The context to be used in the search query. */
  searchQueryContext?: string;
  /**
   * @description Sorting method applied to the return results.
   *  @default relevance
   */
  sort?: Sort;
  /** @description The term to be used in the search query. */
  searchTerm?: string;
}

/**
 * @title SAP Integration
 * @description Search loader
 */
const searchLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext
): Promise<SearchResponse> => {
  const { api } = ctx;
  const {
    currentPage,
    facets,
    fields,
    pageSize,
    searchQueryContext,
    searchTerm,
    sort,
  } = props;

  const facetsQuery = facets
    .reduce(
      (prev, curr) => [...prev, `${curr.key}:${curr.value}`],
      [] as string[]
    )
    .join(":");

  const query = `${searchTerm}:${sort}:${facetsQuery}`;

  const data: SearchResponse = await api["GET /products/search"](
    { currentPage, fields, query, pageSize, searchQueryContext },
    STALE
  ).then((res) => res.json());

  return data;
};

export default searchLoader;
