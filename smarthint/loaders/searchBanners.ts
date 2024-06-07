import { AppContext } from "../mod.ts";
import { Banner } from "../utils/typings.ts";

export type SearchSort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RuleType = "valuedouble" | "valuedate" | "valuestring";

export interface Filter {
  field: string;
  value: string;
}

export interface Props {
  /**
   * @hide
   */
  term?: string;
  size: number;
  searchSort?: SearchSort;
  rule?: string;
  from?: number;
  ruletype?: RuleType;
  filter?: Filter[];
  condition?: {
    field?: string;
    value?: string;
    validation?: string;
  };
}

/**
 * @title Smarthint Integration
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
    from: fromParam,
    rule,
    searchSort,
    size,
    ruletype,
  } = props;

  const url = new URL(req.url);

  const sort = url.searchParams.get("sort") ??
    url.searchParams.get("searchSort") ?? searchSort;

  const filters = url.searchParams.getAll("filter").length
    ? url.searchParams.getAll("filter")
    : filter.length
    ? filter.map((filterItem) => `${filterItem.field}:${filterItem.value}`)
    : undefined;

  const conditionString = condition
    ? `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`
    : undefined;

  const page = Number(url.searchParams.get("page") ?? 1);

  const from = fromParam ?? page <= 1 ? 0 : (page - 1) * size;

  const term = termProp ?? url.searchParams.get("busca");

  if (!term) return null;

  const data = await api["GET /:cluster/Search/GetPrimarySearch"]({
    cluster,
    shcode,
    anonymous: "1", //TODO
    term,
    size: String(size),
    searchSort: String(sort),
    ruletype,
    rule,
    from: String(from),
    filter: filters?.join("&"),
    condition: conditionString,
  }).then((r) => r.json());

  if (!data.Banners) return null;

  return data.Banners;
};

export default loader;
