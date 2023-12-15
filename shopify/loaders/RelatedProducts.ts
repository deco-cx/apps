import type { Product } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import {
  GetProduct,
  ProductRecommendations,
} from "../utils/storefront/queries.ts";
import {
  GetProductQuery,
  GetProductQueryVariables,
  ProductRecommendationsQuery,
  ProductRecommendationsQueryVariables,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Total number of items to display
   * @default 10
   */
  count: number;
}

/**
 * @title Shopify Integration - Related Products
 * @description Product Recommendations loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { storefront } = ctx;
  const { slug, count } = props;

  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);
  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  try {
    const query = await storefront.query<
      GetProductQuery,
      GetProductQueryVariables
    >({
      variables: { handle },
      ...GetProduct,
    });

    if (!query?.product) {
      return [];
    }

    const data = await storefront.query<
      ProductRecommendationsQuery,
      ProductRecommendationsQueryVariables
    >({
      variables: { productId: query.product.id },
      ...ProductRecommendations,
    });

    if (!data?.productRecommendations) {
      return [];
    }

    return data.productRecommendations.map((p) =>
      toProduct(p, p.variants.nodes[0], new URL(req.url))
    ).slice(0, count);
  } catch (error) {
    console.error(error);
  }

  return [];
};

export default loader;
