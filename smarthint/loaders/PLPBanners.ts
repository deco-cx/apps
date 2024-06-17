import { AppContext } from "../mod.ts";
import { Banner, Filter, SearchSort } from "../utils/typings.ts";
import { getSessionCookie } from "../utils/getSession.ts";
import { getFilterParam, getSortParam } from "../utils/transform.ts";

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
  filter?: Filter[];
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
  } = props;

  const url = new URL(req.url);
  const anonymous = getSessionCookie(req.headers);

  const sort = getSortParam(url, searchSort);

  const filters = getFilterParam(url, filter);

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

  if (!data?.Banners) return null;

  return data.Banners;
};

export default loader;
