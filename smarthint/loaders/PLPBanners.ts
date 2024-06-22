import { AppContext } from "../mod.ts";
import { Banner, FilterProp, SearchSort } from "../utils/typings.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { getFilterParam, getSortParam } from "../utils/transform.ts";
import { ProductListingPage } from "../../commerce/types.ts";
import { getCategoriesParam } from "./recommendations.ts";

export type RuleType = "valuedouble" | "valuedate" | "valuestring";

export interface Props {
  /**
   * @hide
   */
  term?: string;
  /**
   * @hide
   */
  searchSort?: SearchSort;
  /**
   * @hide
   */
  filter?: FilterProp[];
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
  /**
   * @description if its a category page setup your store (VTEX,Wake,Shopify,etc) loader here
   */
  page?: ProductListingPage | null;
}

/**
 * @title Smarthint Integration - PLP Banners
 * @description Product List Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Banner[] | null> => {
  const { api, shcode, cluster } = ctx;
  const {
    term: termProp,
    condition,
    filter = [],
    rule,
    searchSort,
    ruletype,
    page: storePageLoader,
  } = props;

  const url = new URL(req.url);
  const { anonymous } = getSessionCookie(req.headers);

  const sort = getSortParam(url, searchSort);

  const filters = getFilterParam(url, filter) ?? [];

  const categories = storePageLoader
    ? getCategoriesParam({ type: "category", page: storePageLoader })
    : undefined;

  const categoriesFilter = categories ? [`categories:${categories}`] : [];

  const conditionString =
    condition?.field && condition.value && condition.validation
      ? `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`
      : undefined;

  const term = termProp ?? url.searchParams.get("busca") ??
    url.searchParams.get("q");

  const commonParams = {
    cluster,
    shcode,
    anonymous,
    size: 1,
    searchSort: Number(sort),
    ruletype,
    rule,
    from: 0,
    filter: [...filters, ...categoriesFilter],
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

  if (!data?.Banners) return null;

  return data.Banners;
};

export default loader;
