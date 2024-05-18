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
  categoryProps?: CategoryProps;
  /**
   * @title Tamanho do conjunto
   * @default 36
   */
  pageSize: number;

  /**
   * @title Indice do conjunto
   * @default 1
   */
  currentPage: number;
}

export interface CategoryProps {
  categoryUrl: string;
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
  const { pageSize, currentPage } = props;

  try {
    const categoryGQL = await clientGraphql.query<
      CategoryGraphQL,
      { path: string }
    >({
      variables: { path: "perfumaria/kits" },
      ...GetCategoryUid,
    });

    if (!categoryGQL.categories.items || categoryGQL.categories.items?.length === 0) {
      return null;
    }

    const plpItemsGQL = await clientGraphql.query<
      ProductPLPGraphQL,
      Omit<ProductSearchInputs, "search">
    >({
      variables: {
        filter: { category_uid: { eq: categoryGQL.categories.items[0].uid } },
        pageSize,
        currentPage,
      },
      ...GetPLPItems,
    });

    if (!plpItemsGQL.products.items || plpItemsGQL.products.items?.length === 0) {
      return null;
    }

    return toProductListingPageGraphQL(plpItemsGQL, categoryGQL, url, imagesQtd)
  } catch (e) {
    console.log(e);
    return null;
  }
};

export default loader;
