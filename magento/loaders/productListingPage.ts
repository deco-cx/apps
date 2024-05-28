import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  CategoryGraphQL,
  FilterProps,
  PLPGraphQL,
  ProductSearchInputs,
  ProductSort,
} from "../utils/clientGraphql/types.ts";
import { GetCategoryUid, GetPLPItems } from "../utils/clientGraphql/queries.ts";
import { toProductListingPageGraphQL } from "../utils/transform.ts";
import {
  formatUrlSuffix,
  transformFilterGraphQL,
  transformSortGraphQL,
} from "../utils/utilsGraphQL.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";

export interface Props {
  urlKey: RequestURLParam;

  /**
   * @title Set Size
   * @default 36
   */
  pageSize: number;

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
 * @title Magento Integration - PLP
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { clientGraphql, imagesQtd, customFilters, site, useSuffix } = ctx;
  const { pageSize, categoryProps, urlKey } = props;
  const currentPage = url.searchParams.get("p") ?? 1;
  const sortFromUrl = url.searchParams.get("product_list_order");
  const defaultPath = useSuffix ? formatUrlSuffix(site) : undefined;

  const { sortBy, order } = categoryProps?.sortOptions ?? {
    sortBy: sortFromUrl
      ? {
          value: sortFromUrl,
        }
      : undefined,
    order: "ASC",
  };
  const categoryUrl = categoryProps?.categoryUrl ?? urlKey;

  if (!categoryUrl) {
    return null;
  }

  const categoryGQL = await clientGraphql.query<
    CategoryGraphQL,
    { path: string }
  >({
    variables: { path: categoryUrl },
    ...GetCategoryUid,
  });
  if (
    !categoryGQL.categories.items ||
    categoryGQL.categories.items?.length === 0
  ) {
    return null;
  }

  const plpItemsGQL = await clientGraphql.query<
    PLPGraphQL,
    Omit<ProductSearchInputs, "search">
  >({
    variables: {
      filter: {
        category_uid: { in: [categoryGQL.categories.items[0].uid] },
        ...transformFilterGraphQL(url, customFilters, categoryProps?.filters),
      },
      pageSize,
      currentPage: Number(currentPage),
      sort: transformSortGraphQL({ sortBy: sortBy!, order }),
    },
    ...GetPLPItems,
  });

  if (!plpItemsGQL.products.items || plpItemsGQL.products.items?.length === 0) {
    return null;
  }

  return toProductListingPageGraphQL(
    plpItemsGQL,
    categoryGQL,
    url,
    imagesQtd,
    defaultPath
  );
};

export default loader;
