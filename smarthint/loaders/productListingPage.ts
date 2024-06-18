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
import { RuleType } from "./PLPBanners.ts";

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
 * @title Smarthint Integration - Product List Page
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;
  const {
    size = 12,
    from: fromParam = 0,
    filter = [],
    searchSort,
    term: termProp,
    condition,
    rule,
    ruletype,
  } = props;

  const url = new URL(req.url);

  const { page, from } = resolvePage(url, size, fromParam);

  const sort = getSortParam(url, searchSort);

  const filters = getFilterParam(url, filter);

  const anonymous = getSessionCookie(req.headers);

  const term = termProp ?? url.searchParams.get("busca") ??
    url.searchParams.get("q");

  const conditionString =
    condition?.field && condition.value && condition.validation
      ? `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`
      : undefined;

  const commonParams = {
    cluster,
    shcode,
    anonymous,
    size,
    searchSort: Number(sort),
    ruletype,
    rule,
    from,
    filter: filters,
    condition: conditionString,
  };

  const data = term
    ? await api["GET /:cluster/Search/GetPrimarySearch"]({
      ...commonParams,
      term,
    }).then((r) => r.json())
    : await api["GET /:cluster/hotsite"]({
      ...commonParams,
      url: url.pathname.replace("/", ""),
    }).then((r) => r.json()).then((result) => result.SearchResult);

  if (!data) return null;

  if (data.IsRedirect) {
    redirect(
      new URL(data?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products = data?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data?.Sorts ?? []);

  const resultFilters = toFilters(data?.Filters ?? [], url);

  const { nextPage, previousPage } = getPaginationInfo(
    url,
    size,
    from,
    page,
    data?.TotalResult,
  );

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    filters: resultFilters,
    pageInfo: {
      records: data?.TotalResult,
      recordPerPage: size,
      nextPage: nextPage,
      previousPage: previousPage,
      currentPage: page,
      pageTypes: [
        term ? "Search" : "Collection",
      ],
    },
  };
};

export default loader;
