import type { ProductListingPage } from "../../commerce/types.ts";
import { SortOption } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import {
  getVariations,
  MAXIMUM_REQUEST_QUANTITY,
} from "../utils/getVariations.ts";
import { GetURL, Hotsite, Search } from "../utils/graphql/queries.ts";
import {
  GetUrlQuery,
  GetUrlQueryVariables,
  HotsiteQuery,
  HotsiteQueryVariables,
  ProductFragment,
  ProductSortKeys,
  SearchQuery,
  SearchQueryVariables,
  SortDirection,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { FILTER_PARAM, toFilters, toProduct } from "../utils/transform.ts";

export type Sort =
  | "NAME:ASC"
  | "NAME:DESC"
  | "RELEASE_DATE:DESC"
  | "PRICE:ASC"
  | "PRICE:DESC"
  | "DISCOUNT:DESC"
  | "SALES:DESC";

export const SORT_OPTIONS: SortOption[] = [
  { value: "NAME:ASC", label: "Nome A-Z" },
  { value: "NAME:DESC", label: "Nome Z-A" },
  { value: "RELEASE_DATE:DESC", label: "Lançamentos" },
  { value: "PRICE:ASC", label: "Menores Preços" },
  { value: "PRICE:DESC", label: "Maiores Preços" },
  { value: "DISCOUNT:DESC", label: "Maiores Descontos" },
  { value: "SALES:DESC", label: "Mais Vendidos" },
];

type SortValue = `${ProductSortKeys}:${SortDirection}`;
export interface Props {
  /**
   * @title Count
   * @description Number of products to display
   * @maximum 50
   */
  limit?: number;

  /** @description Types of operations to perform between query terms */
  operation?: "AND" | "OR";

  /**
   * @ignore
   */
  page: number;

  /**
   * @title Sorting
   */
  sort?: Sort;

  /**
   * @description overides the query term
   */
  query?: string;

  /**
   * @title Only Main Variant
   * @description Toggle the return of only main variants or all variations separeted.
   */
  onlyMainVariant?: boolean;

  filters?: {
    /** @description The set of attributes to filter. */
    attributes?: {
      id?: number[];
      name?: string[];
      type?: string[];
      value?: string[];
    };
    /** @description Choose if you want to retrieve only the available products in stock. */
    available?: boolean;
    /** @description The set of brand IDs which the result item brand ID must be included in. */
    brandId?: number[];
    /** @description The set of category IDs which the result item category ID must be included in. */
    categoryId?: number[];
    /** @description The set of EANs which the result item EAN must be included. */
    ean?: string[];
    /** @description Retrieve the product variant only if it contains images. */
    hasImages?: boolean;
    /** @description Retrieve the product variant only if it is the main product variant. */
    mainVariant?: boolean;
    /** @description The set of prices to filter. */
    prices?: {
      /** @description The product discount must be greater than or equal to. */
      discount_gte?: number;
      /** @description The product discount must be lesser than or equal to. */
      discount_lte?: number;
      /** @description Return only products where the listed price is more than the price. */
      discounted?: boolean;
      /** @description The product price must be greater than or equal to. */
      price_gte?: number;
      /** @description The product price must be lesser than or equal to. */
      price_lte?: number;
    };
    /** @description The product unique identifier (you may provide a list of IDs if needed). */
    productId?: number[];
    /** @description The product variant unique identifier (you may provide a list of IDs if needed). */
    productVariantId?: number[];
    /** @description A product ID or a list of IDs to search for other products with the same parent ID. */
    sameParentAs?: number[];
    /** @description The set of SKUs which the result item SKU must be included. */
    sku?: string[];
    /** @description Show products with a quantity of available products in stock greater than or equal to the given number. */
    /**
     *  @title Stock greater than or equal
     *  @description Show products with a quantity of available products in stock greater than or equal to the given number. */
    stock_gte?: number;
    /**
     * @title Stock less than or equal
     * @description Show products with a quantity of available products in stock less than or equal to the given number. */
    stock_lte?: number;
    /** @description The set of stocks to filter. */
    stocks?: {
      dcId?: number[];
      /** @description The distribution center names to match. */
      dcName?: string[];
      /** @description The product stock must be greater than or equal to. */
      /**
       * @title Stock greater than or equal
       * @description The product stock must be greater than or equal to.
       */
      stock_gte?: number;
      /**
       * @title Stock less than or equal
       * @description The product stock must be lesser than or equal to.
       */
      stock_lte?: number;
    };
    /**
     * @title Upated after
     * @format date
     * @description Retrieve products which the last update date is greater than or equal to the given date.
     */
    updatedAt_gte?: string;
    /**
     * @title Upated before
     * @format date
     * @description Retrieve products which the last update date is less than or equal to the given date.
     */
    updatedAt_lte?: string;
  };

  /** @description Retrieve variantions for each product. */
  getVariations?: boolean;
}

const OUTSIDE_ATTRIBUTES_FILTERS = ["precoPor"];

const filtersFromParams = (searchParams: URLSearchParams) => {
  const mapped = searchParams.getAll(FILTER_PARAM).reduce((acc, value) => {
    const test = /.*:.*/;

    // todo validar
    const [field, val] = test.test(value)
      ? value.split(":")
      : value.split("__");

    if (OUTSIDE_ATTRIBUTES_FILTERS.includes(field)) return acc;

    if (!acc.has(field)) acc.set(field, []);
    acc.get(field)?.push(val);
    return acc;
  }, new Map<string, string[]>());

  const filters: Array<{ field: string; values: string[] }> = [];
  for (const [field, values] of mapped.entries()) {
    filters.push({ field, values });
  }

  return filters;
};

/**
 * @title Wake Integration
 * @description Product Listing Page loader
 */
const searchLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  // get url from params
  const url = new URL(req.url);
  const { storefront } = ctx;

  const headers = parseHeaders(req.headers);

  const limit = Number(url.searchParams.get("tamanho") ?? props.limit ?? 12);

  const filters = filtersFromParams(url.searchParams) ?? props.filters;
  const sort = (url.searchParams.get("sort") as SortValue | null) ??
    (url.searchParams.get("ordenacao") as SortValue | null) ??
    props.sort ??
    "SALES:DESC";
  const page = props.page ?? Number(url.searchParams.get("page")) ??
    Number(url.searchParams.get("pagina")) ?? 0;
  const query = props.query ?? url.searchParams.get("busca");
  const operation = props.operation ?? "AND";

  const [sortKey, sortDirection] = sort.split(":") as [
    ProductSortKeys,
    SortDirection,
  ];

  const onlyMainVariant = props.onlyMainVariant ?? true;
  const [minimumPrice, maximumPrice] =
    url.searchParams.getAll("filtro")?.find((i) => i.startsWith("precoPor"))
      ?.split(":")[1]?.split(";").map(Number) ??
      url.searchParams.get("precoPor")?.split(";").map(Number) ?? [];

  const offset = page <= 1 ? 0 : page * limit;

  const urlData = await storefront.query<GetUrlQuery, GetUrlQueryVariables>({
    variables: {
      url: url.pathname,
    },
    ...GetURL,
  }, {
    headers,
  });

  const isHotsite = urlData.uri?.kind === "HOTSITE";

  const comoonParams = {
    sortDirection,
    sortKey,
    filters,
    limit: Math.min(limit, MAXIMUM_REQUEST_QUANTITY),
    offset,
    onlyMainVariant,
    minimumPrice,
    maximumPrice,
  };

  if (!query && !isHotsite) return null;

  const data = isHotsite
    ? await storefront.query<HotsiteQuery, HotsiteQueryVariables>({
      variables: {
        ...comoonParams,
        url: url.pathname,
      },
      ...Hotsite,
    })
    : await storefront.query<SearchQuery, SearchQueryVariables>({
      variables: {
        ...comoonParams,
        query,
        operation,
      },
      ...Search,
    });

  const products = data?.result?.productsByOffset?.items ?? [];

  const nextPage = new URLSearchParams(url.searchParams);
  const previousPage = new URLSearchParams(url.searchParams);

  const hasNextPage = Boolean(
    (data?.result?.productsByOffset?.totalCount ?? 0) %
      (data?.result?.productsByOffset?.pageSize ?? 0),
  );

  const hasPreviouePage = page > 1;

  if (hasNextPage) {
    nextPage.set("page", (page + 1).toString());
  }

  if (hasPreviouePage) {
    previousPage.set("page", (page - 1).toString());
  }

  const productIDs = products.map((i) => i?.productId);

  const variations = props.getVariations
    ? await getVariations(storefront, productIDs, headers, url)
    : [];

  const itemListElement: ProductListingPage["breadcrumb"]["itemListElement"] =
    data?.result?.breadcrumbs?.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: b!.link!,
      name: b!.text!,
    })) ?? [];

  return {
    "@type": "ProductListingPage",
    filters: toFilters(data?.result?.aggregations, { base: url }),
    pageInfo: {
      nextPage: hasPreviouePage ? `?${nextPage}` : undefined,
      previousPage: hasNextPage ? `?${previousPage}` : undefined,
      currentPage: data?.result?.productsByOffset?.page ?? 1,
      records: data?.result?.productsByOffset?.totalCount,
      recordPerPage: limit,
    },
    sortOptions: SORT_OPTIONS,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    products: products
      ?.filter((p): p is ProductFragment => Boolean(p))
      .map((variant) => {
        const productVariations = variations?.filter((v) =>
          v.inProductGroupWithID === variant.productId
        );

        return toProduct(variant, { base: url }, productVariations);
      }),
  };
};

export default searchLoader;
