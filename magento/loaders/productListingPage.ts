import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  CategoryGraphQL,
  ProductPLPGraphQL,
  ProductSearchInputs,
  ProductSort,
  FilterProps,
} from "../utils/clientGraphql/types.ts";
import { GetPLPItems, GetCategoryUid } from "../utils/clientGraphql/queries.ts";
import { toProductListingPageGraphQL } from "../utils/transform.ts";
import {
  transformFilterGraphQL,
  transformSortGraphQL,
} from "../utils/utils.ts";

export interface Props {
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
  const { clientGraphql, imagesQtd, customFilters } = ctx;
  const { pageSize, categoryProps } = props;
  const currentPage = url.searchParams.get("p") ?? 1;
  const sortFromUrl = url.searchParams.get("product_list_order");
  const { sortBy, order } = categoryProps?.sortOptions ?? {
    sortBy: sortFromUrl
      ? {
          value: sortFromUrl,
        }
      : undefined,
    order: "ASC",
  };
  const categoryUrl =
    categoryProps?.categoryUrl ?? url.pathname.match(/\/granado\/(.+)/)?.[1];

  if (!categoryUrl) {
    return null;
  }

  try {
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
      ProductPLPGraphQL,
      Omit<ProductSearchInputs, "search">
    >({
      variables: {
        filter: {
          category_uid: { eq: categoryGQL.categories.items[0].uid },
          ...transformFilterGraphQL(url, customFilters, categoryProps?.filters),
        },
        pageSize,
        currentPage: Number(currentPage),
        sort: transformSortGraphQL({ sortBy: sortBy!, order }),
      },
      ...GetPLPItems,
    });

    if (
      !plpItemsGQL.products.items ||
      plpItemsGQL.products.items?.length === 0
    ) {
      return null;
    }

    return toProductListingPageGraphQL(
      plpItemsGQL,
      categoryGQL,
      url,
      imagesQtd
    );
  } catch (error) {
    console.log(error);
    return null;
  }
};

export default loader;
