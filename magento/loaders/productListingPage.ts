import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  CategoryGraphQL,
  ProductPLPGraphQL,
  ProductSearchInputs,
} from "../utils/clientGraphql/types.ts";
import { GetPLPItems, GetCategoryUid } from "../utils/clientGraphql/queries.ts";
import { toProductListingPageGraphQL } from "../utils/transform.ts";

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
  const { clientGraphql, imagesQtd } = ctx;
  const { pageSize, categoryProps } = props;
  const currentPage = url.searchParams.get("p") ?? 1;
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
        filter: { category_uid: { eq: categoryGQL.categories.items[0].uid } },
        pageSize,
        currentPage: Number(currentPage),
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
