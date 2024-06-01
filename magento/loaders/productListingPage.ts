import type { ProductListingPage } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import {
  CategoryGraphQL,
  CustomFields,
  FilterProps,
  PLPGraphQL,
  ProductSearchInputs,
  ProductSort,
} from "../utils/clientGraphql/types.ts";
import { GetCategoryUid, GetPLPItems } from "../utils/clientGraphql/queries.ts";
import { toProductListingPageGraphQL } from "../utils/transform.ts";
import {
  formatUrlSuffix,
  getCustomFields,
  transformFilterGraphQL,
  transformSortGraphQL,
} from "../utils/utilsGraphQL.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { STALE } from "../../utils/fetch.ts";

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
 * @title Magento Integration - PLP
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<ProductListingPage | null> => {
  const url = new URL(req.url);
  const { clientGraphql, imagesQtd, customFilters, site, useSuffix } = ctx;
  const { pageSize, categoryProps, urlKey, customFields } = props;
  const currentPage = url.searchParams.get("p") ?? 1;
  const sortFromUrl = url.searchParams.get("product_list_order");
  const defaultPath = useSuffix ? formatUrlSuffix(site) : undefined;
  const customAttributes = getCustomFields(customFields, ctx.customAttributes);

  const { sortBy, order } = sortFromUrl
    ? {
        sortBy: {
          value: sortFromUrl,
        },
        order: "ASC",
      }
    : categoryProps?.sortOptions ?? { sortBy: undefined, order: "ASC" };
  const categoryUrl = categoryProps?.categoryUrl ?? urlKey;

  if (!categoryUrl) {
    return null;
  }

  try {
    const categoryGQL = await clientGraphql.query<
      CategoryGraphQL,
      { path: string }
    >(
      {
        variables: { path: categoryUrl },
        ...GetCategoryUid,
      },
      STALE
    );
    if (
      !categoryGQL.categories.items ||
      categoryGQL.categories.items?.length === 0
    ) {
      return null;
    }

    const plpItemsGQL = await clientGraphql.query<
      PLPGraphQL,
      Omit<ProductSearchInputs, "search">
    >(
      {
        variables: {
          filter: {
            category_uid: { in: [categoryGQL.categories.items[0].uid] },
            ...transformFilterGraphQL(
              url,
              customFilters,
              categoryProps?.filters
            ),
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
      STALE
    );

    if (
      !plpItemsGQL.products.items ||
      plpItemsGQL.products.items?.length === 0
    ) {
      return null;
    }

    return toProductListingPageGraphQL(plpItemsGQL, categoryGQL, {
      originURL: url,
      imagesQtd,
      defaultPath,
      customAttributes,
    });
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const cache = "stale-while-revalidate";

export const cacheKey = (_props: Props, req: Request, _ctx: AppContext) => {
  const url = new URL(req.url);
  return `${url.href}/PLP`;
};

export default loader;
