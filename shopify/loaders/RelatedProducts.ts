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
  HasMetafieldsMetafieldsArgs,
  ProductRecommendationsQuery,
  ProductRecommendationsQueryVariables,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { toProduct } from "../utils/transform.ts";
import { Metafield } from "../utils/types.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Total number of items to display
   * @default 10
   */
  count: number;
  /**
   * @title Metafields
   * @description search for metafields
   */
  metafields?: Metafield[];
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
  const metafields = props.metafields || [];

  const query = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables & HasMetafieldsMetafieldsArgs
  >({
    variables: { handle, identifiers: metafields },
    ...GetProduct,
  });

  if (!query?.product) {
    return [];
  }

  const data = await storefront.query<
    ProductRecommendationsQuery,
    ProductRecommendationsQueryVariables & HasMetafieldsMetafieldsArgs
  >({
    variables: {
      productId: query.product.id,
      identifiers: metafields,
    },
    ...ProductRecommendations,
  });

  if (!data?.productRecommendations) {
    return [];
  }

  return data.productRecommendations.map((p) =>
    toProduct(p, p.variants.nodes[0], new URL(req.url))
  ).slice(0, count);
};

export const cache = "no-cache";

export const cacheKey = (props: Props, req: Request): string => {
  const { slug, count } = props;
  const searchParams = new URLSearchParams({
    slug,
    count: count.toString(),
  });

  const url = new URL(req.url);
  url.search = searchParams.toString();
  return url.href;
};

export default loader;
