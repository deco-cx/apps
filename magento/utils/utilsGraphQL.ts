import { FiltersGraphQL } from "../mod.ts";
import {
  CustomFields,
  FilterEqualTypeInput,
  FilterMatchTypeInput,
  FilterProps,
  FilterRangeTypeInput,
  ProductFilterInput,
  ProductSort,
  ProductSortInput,
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
): ProductFilterInput | undefined => ({
  ...filtersFromUrlGraphQL(url, customFilters),
  ...filtersFromLoaderGraphQL(fromLoader),
});

export const filtersFromLoaderGraphQL = (
  fromLoader?: Array<FilterProps>
): ProductFilterInput | undefined =>
  fromLoader?.reduce<ProductFilterInput>(
    (acc, f) => ({
      ...acc,
      [f.name]: f.type,
    }),
    {}
  ) ?? {};

export const filtersFromUrlGraphQL = (
  url: URL,
  customFilters?: Array<FiltersGraphQL>
) =>
  DEFAULT_GRAPHQL_FILTERS.concat(
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

export const formatUrlSuffix = (str: string) => {
  str = str.startsWith("/") ? str.slice(0, -1) : str;
  str = str.endsWith("/") ? str : str + "/";
  return str;
};

export const getCustomFields = ({
  active,
  overrideList,
}: CustomFields, customFiels?: Array<string>): Array<string> | undefined => {
  if (!active) {
    return undefined;
  }

  if (overrideList && overrideList.length > 0) {
    return overrideList;
  }

  return customFiels
};
