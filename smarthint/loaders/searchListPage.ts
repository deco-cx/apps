import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  getFilterParam,
  getPaginationInfo,
  getSortParam,
  resolvePage,
  toFilters,
  toProduct,
  toSortOption,
} from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { Filter, SearchSort } from "../utils/typings.ts";

export type RuleType = "valuedouble" | "valuedate" | "valuestring";

export interface Props {
  /**
   * @hide
   */
  term?: string;
  /**
   * @description Number of products that must be returned per page
   */
  size: number;
  /**
   * @hide
   */
  searchSort?: SearchSort;
  /**
   * @hide
   */
  filter?: Filter[];
  /**
   * @hide
   */
  from?: number;
  /**
   * @hide
   */
  rule?: string;
  /**
   * @hide
   */
  ruletype?: RuleType;
  /**
   * @hide
   */
  condition?: {
    field?: string;
    value?: string;
    validation?: string;
  };
}

/**
 * @title Smarthint Search
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;
  const {
    term: termProp,
    condition,
    filter = [],
    from: fromParam,
    rule,
    searchSort,
    size,
    ruletype,
  } = props;

  const url = new URL(req.url);
  const anonymous = getSessionCookie(req.headers);

  const sort = getSortParam(url, searchSort);

  const filters = getFilterParam(url, filter);

  const conditionString =
    condition?.field && condition.value && condition.validation
      ? `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`
      : undefined;

  const { page, from } = resolvePage(url, size, fromParam);

  const term = termProp ?? url.searchParams.get("busca") ??
    url.searchParams.get("q");

  if (!term) return null;

  const data = await api["GET /:cluster/Search/GetPrimarySearch"]({
    cluster,
    shcode,
    anonymous,
    term,
    size: size,
    searchSort: Number(sort),
    ruletype,
    rule,
    from: from,
    filter: filters,
    condition: conditionString,
  }).then((r) => r.json());

  if (data?.IsRedirect) {
    redirect(
      new URL(data?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products = data?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data?.Sorts ?? []);

  const pageFilters = toFilters(data?.Filters ?? [], url);

  const { nextPage, previousPage } = getPaginationInfo(
    url,
    size,
    from,
    page,
    data.TotalResult,
  );

  return {
    "@type": "ProductListingPage",
    products: products,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    sortOptions,
    filters: pageFilters,
    pageInfo: {
      records: data?.TotalResult,
      recordPerPage: size,
      nextPage: nextPage,
      previousPage: previousPage,
      currentPage: page,
      pageTypes: [
        "Search",
      ],
    },
  };
};

export default loader;
