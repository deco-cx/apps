import { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toFilters, toProduct, toSortOption } from "../utils/transform.ts";
import { redirect } from "deco/mod.ts";

export type SearchSort = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type RuleType = "valuedouble" | "valuedate" | "valuestring";

export interface Filter {
  field: string;
  value: string;
}

export interface Props {
  term: string;
  size: number;
  searchSort?: SearchSort;
  rule?: string;
  from?: number;
  ruletype?: RuleType;
  filter?: Filter[];
  condition?: {
    field: string;
    value: string;
    validation: string;
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
): Promise<ProductListingPage | null> => {
  const { api, shcode, cluster } = ctx;
  const { term, condition, filter = [], from: fromParam, rule, searchSort, size, ruletype } =
    props;

  const url = new URL(req.url);

  const filterString = filter.length ? filter.map((filterItem) =>
    `${filterItem.field}:${filterItem.value}`
  ).join("&") : undefined;

  const conditionString = condition ?
    `valueDouble:${condition.field}:${condition.value}:validation:${condition.validation}`: undefined;

  const page = Number(url.searchParams.get("page")) ?? 1

  const from = fromParam ?? page <= 1 ? 0 : (page - 1) * size;

  const data = await api["GET /:cluster/Search/GetPrimarySearch"]({
    cluster,
    shcode,
    anonymous: "1", //TODO
    term,
    size: String(size),
    searchSort: String(searchSort),
    ruletype,
    rule,
    from: String(from),
    filter: filterString,
    condition: conditionString,
  }).then((r) => r.json());

  console.log (data.TotalResult)

  if (data?.IsRedirect) {
    redirect(
      new URL(data?.urlRedirect!, url.origin)
        .href,
    );
  }

  const products = data?.Products?.map((product) => toProduct(product)) ?? [];

  const sortOptions = toSortOption(data?.Sorts ?? []);

  const filters = toFilters(data?.Filters ?? []);

  // const hasNextPage = Boolean(
  //   (data?.TotalResult ?? 0) /
  //       (size) >
  //     (data?.result?.productsByOffset?.page ?? 0),
  // );

  return {
    "@type": "ProductListingPage",
    products: products,
    sortOptions,
    filters,
    pageInfo: {
      records: data?.TotalResult,
      recordPerPage: size,
      currentPage: page,
      pageTypes: [
        "Search"
      ]
    },
  };
};

export default loader;
