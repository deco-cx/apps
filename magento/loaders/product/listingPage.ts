import type { ProductListingPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  CategoryGraphQL,
  CustomFields,
  FilterProps,
  PLPGraphQL,
  ProductSearchInputs,
  ProductSort,
} from "../../utils/clientGraphql/types.ts";
import {
  GetCategoryUid,
  GetPLPItems,
} from "../../utils/clientGraphql/queries.ts";
import { toProductListingPageGraphQL } from "../../utils/transform.ts";
import {
  filtersFromLoaderGraphQL,
  formatUrlSuffix,
  getCustomFields,
  transformFilterGraphQL,
  transformSortGraphQL,
} from "../../utils/utilsGraphQL.ts";
import { STALE as DecoStale } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";

export interface Props {
  urlKey: RequestURLParam;

  /**
   * @title Set Size
   * @default 36
   */
  pageSize: number;

  /**
   * @title Product custom attributes
   * @default false
   */
  customFields: CustomFields;

  categoryProps?: CategoryProps;
}

export interface CategoryProps {
  categoryUrl?: string;
  /** @title Sorting */
  sortOptions?: ProductSort;
  /** @title Filters */
  filters?: Array<FilterProps>;
}

/**
 * @title Magento Integration - Product Listing Page
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const {
    clientGraphql,
    imagesQtd,
    customFilters,
    site,
    useSuffix,
    enableCache,
    maxInstallments,
    minInstallmentValue,
  } = ctx;
  const { pageSize, categoryProps, urlKey, customFields } = props;
  const currentPage = url.searchParams.get("p") ?? 1;
  const sortFromUrl = url.searchParams.get("sort");
  const defaultPath = useSuffix ? formatUrlSuffix(site) : undefined;
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);
  const { sortBy, order } = getSortOptions(sortFromUrl, categoryProps);
  const categoryUrl = categoryProps?.categoryUrl ?? urlKey;
  const STALE = enableCache ? DecoStale : undefined;

  if (!categoryUrl) {
    return null;
  }

  const { categories } = await clientGraphql.query<
    CategoryGraphQL,
    { path: string }
  >(
    {
      variables: { path: categoryUrl },
      ...GetCategoryUid,
    },
    STALE,
  );
  if (!categories.items || categories.items?.length === 0) {
    return null;
  }

  const { products } = await clientGraphql.query<
    PLPGraphQL,
    Omit<ProductSearchInputs, "search">
  >(
    {
      variables: {
        filter: {
          category_uid: { in: [categories.items[0].uid] },
          ...transformFilterGraphQL(url, customFilters, categoryProps?.filters),
        },
        pageSize,
        currentPage: Number(currentPage),
        sort: transformSortGraphQL({
          sortBy: sortBy!,
          order: order as "ASC" | "DESC",
        }),
      },
      ...GetPLPItems(customAttributes),
    },
    STALE,
  );

  if (!products.items || products.items?.length === 0) {
    return null;
  }

  return toProductListingPageGraphQL(
    { products },
    { categories },
    {
      originURL: url,
      imagesQtd,
      defaultPath,
      customAttributes,
      maxInstallments,
      minInstallmentValue,
    },
  );
};

const getSortOptions = (sortFromUrl: string | null, props?: CategoryProps) =>
  sortFromUrl
    ? {
      sortBy: {
        value: sortFromUrl,
      },
      order: "ASC",
    }
    : props?.sortOptions ?? { sortBy: undefined, order: "ASC" };

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  const { customFields, pageSize, categoryProps, urlKey } = props;
  const categoryUrl = categoryProps?.categoryUrl ?? urlKey;
  const customAttributes = getCustomFields(customFields, ["ALL"]);
  const sortFromUrl = url.searchParams.get("product_list_order");
  const { sortBy, order } = getSortOptions(sortFromUrl, categoryProps);
  const filtersFromProps = filtersFromLoaderGraphQL(categoryProps?.filters);
  return `${url.href}-category:${categoryUrl}-customAtt:${
    customAttributes?.join("|") ?? "NONE"
  }-sortBy:${sortBy?.value}-order:${order}-size:${pageSize}-filtersFromProps:${
    JSON.stringify(
      filtersFromProps,
    )
  }-PLP`;
};

export default loader;
