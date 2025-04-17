import { PageInfo } from "../../../commerce/types.ts";
import { AppContext } from "../../../shopify/mod.ts";
import { OrdersByCustomer } from "../../utils/storefront/queries.ts";
import { getUserCookie } from "../../utils/user.ts";
import {
  Order,
  QueryRoot,
  QueryRootCustomerArgs,
  QueryRootLocationsArgs,
} from "../../utils/storefront/storefront.graphql.gen.ts";

export interface Props {
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count: number;
  /**
   * @title Starting page query parameter offset.
   * @description Set the starting page offset. Default to 1.
   */
  pageOffset?: number;
  /**
   * @hide
   * @description it is hidden because only page prop is not sufficient, we need cursors
   */
  page?: number;
  /**
   * @hide
   * @description at admin user do not know cursor, it is useful to invokes like show more products
   */
  startCursor?: string;
  /**
   * @hide
   * @description at admin user do not know cursor, it is useful to invokes like show more products
   */
  endCursor?: string;
}

/**
 * @title Shopify Integration
 * @description Order List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<{
  orders: Order[];
  pageInfo: PageInfo;
}> => {
  const { storefront } = ctx;
  const customerAccessToken = getUserCookie(req.headers);

  if (!customerAccessToken) {
    ctx.response.status = 401;
    return {
      orders: [],
      pageInfo: {
        nextPage: undefined,
        previousPage: undefined,
        currentPage: 1,
        records: 0,
        recordPerPage: props.count,
      },
    };
  }

  const url = new URL(req.url);
  const searchParams = url.searchParams;

  const { count = 12, pageOffset = 1 } = props;
  const pageParam = searchParams.get("page")
    ? Number(searchParams.get("page")) - pageOffset
    : 0;

  const page = props.page ?? pageParam;
  const startCursor = props.startCursor ?? searchParams.get("startCursor") ??
    "";
  const endCursor = props.endCursor ?? searchParams.get("endCursor") ?? "";

  const variables = {
    customerAccessToken,
    ...(startCursor && { after: startCursor, first: count }),
    ...(endCursor && { before: endCursor, last: count }),
    ...(!startCursor && !endCursor && { first: count }),
  };

  const data = await storefront.query<
    QueryRoot,
    QueryRootCustomerArgs & QueryRootLocationsArgs
  >({
    ...OrdersByCustomer,
    variables,
  });

  const orders = data.customer?.orders?.nodes ?? [];
  const pageInfo = data.customer?.orders?.pageInfo;

  if (!pageInfo) {
    throw new Error("Missing pageInfo from Shopify response");
  }

  const nextPage = new URLSearchParams(searchParams);
  const previousPage = new URLSearchParams(searchParams);

  if (pageInfo.hasNextPage) {
    nextPage.set("page", (page + pageOffset + 1).toString());
    nextPage.set("startCursor", pageInfo.endCursor ?? "");
    nextPage.delete("endCursor");
  }

  if (pageInfo.hasPreviousPage) {
    previousPage.set("page", (page + pageOffset - 1).toString());
    previousPage.set("endCursor", pageInfo.startCursor ?? "");
    previousPage.delete("startCursor");
  }

  const currentPage = Math.max(1, page + pageOffset);

  return {
    orders,
    pageInfo: {
      nextPage: pageInfo.hasNextPage ? `?${nextPage}` : undefined,
      previousPage: pageInfo.hasPreviousPage ? `?${previousPage}` : undefined,
      currentPage,
      records: data.customer?.orders.totalCount ?? 0,
      recordPerPage: count,
    },
  };
};

export default loader;
