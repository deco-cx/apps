import { FiltersGraphQL } from "./clientGraphql/types.ts";
import {
  FilterProps,
  ProductFilterInput,
  ProductSort,
  ProductSortInput,
  FilterEqualTypeInput,
  FilterMatchTypeInput,
  FilterRangeTypeInput,
} from "./clientGraphql/types.ts";
import { DEFAULT_GRAPHQL_FILTERS } from "./constants.ts";

export const typeChecker = <T extends object>(v: T, prop: keyof T) => prop in v;

export const transformSortGraphQL = ({
  sortBy,
  order,
}: Partial<ProductSort>): ProductSortInput | undefined => {
  if (!sortBy) {
    return undefined;
  }
  return {
    [sortBy.value]: order ?? "ASC",
  };
};

export const transformFilterGraphQL = (
  url: URL,
  customFilters?: Array<FiltersGraphQL>,
  fromLoader?: Array<FilterProps>
): ProductFilterInput | undefined => {
  const filtersFromLoader = fromLoader?.map<ProductFilterInput>((f) => ({
    [f.name]: f.type,
  })) ?? {};

  const filtersFromUrl = DEFAULT_GRAPHQL_FILTERS.concat(
    customFilters ?? []
  ).reduce<ProductFilterInput>((acc, { type, value }) => {
    const fromUrl = url.searchParams.get(value);
    if (!fromUrl) {
      return acc;
    }
    return {
      ...acc,

      [value]: transformFilterValueGraphQL(fromUrl, type),
    };
  }, {});

  return {...filtersFromUrl, ...filtersFromLoader};
};

export const transformFilterValueGraphQL = (
  value: string,
  type: "EQUAL" | "MATCH" | "RANGE"
): FilterEqualTypeInput | FilterMatchTypeInput | FilterRangeTypeInput => {
  if (type === "EQUAL") {
    return { eq: value } as FilterEqualTypeInput;
  }

  if (type === "MATCH") {
    return {
      match: value,
    } as FilterMatchTypeInput;
  }

  if (type === "RANGE") {
    const splitterIndex = value.indexOf("_");
    return {
      from: value.substring(0, splitterIndex),
      to: value.substring(splitterIndex + 1),
    } as FilterRangeTypeInput;
  }

  return {};
};