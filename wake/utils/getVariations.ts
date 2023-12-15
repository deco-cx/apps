import { GetProducts } from "../utils/graphql/queries.ts";
import {
  GetProductsQuery,
  GetProductsQueryVariables,
  ProductFragment,
} from "../utils/graphql/storefront.graphql.gen.ts";
import type { AppContext } from "../mod.ts";
import { toProduct } from "./transform.ts";

export const MAXIMUM_REQUEST_QUANTITY = 50;

export const getVariations = async (
  storefront: AppContext["storefront"],
  productIds: number[],
  headers: Headers,
  base: URL,
) => {
  const variations: ProductFragment[] = [];

  const fetchData = async (cursor?: string) => {
    const data = await storefront.query<
      GetProductsQuery,
      GetProductsQueryVariables
    >({
      variables: {
        first: MAXIMUM_REQUEST_QUANTITY,
        filters: { productId: productIds },
        sortDirection: "ASC",
        sortKey: "RANDOM",
        after: cursor,
      },
      ...GetProducts,
    }, {
      headers,
    });

    if (data.products?.nodes?.length) {
      variations.push(
        ...data.products.nodes.filter((v): v is ProductFragment => Boolean(v)),
      );
    }

    if (
      data.products?.pageInfo.hasNextPage && data.products.pageInfo.endCursor
    ) {
      await fetchData(data.products.pageInfo.endCursor);
    }
  };

  await fetchData();

  return variations.map((i) => toProduct(i, { base }));
};
