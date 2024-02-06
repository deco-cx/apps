import type { Product } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import type { AppContext } from "../mod.ts";
import { ProductRecommendations } from "../utils/graphql/queries.ts";
import {
  ProductFragment,
  ProductRecommendationsQuery,
  ProductRecommendationsQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseSlug, toProduct } from "../utils/transform.ts";
import { parseHeaders } from "../utils/parseHeaders.ts";
import { getVariations } from "../utils/getVariations.ts";

export interface Props {
  /**
   * @default DEFAULT
   * @description Algorithm type
   */
  algorithm: "DEFAULT" | "DEFAULT";
  quantity: number;
  slug: RequestURLParam;
  /** @description Retrieve variantions for each product. */
  getVariations?: boolean;
}

/**
 * @title Wake Integration - Product Recommendations
 * @description Product Recommendations loader
 */
const productRecommendationsLoader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const url = new URL(req.url);
  const { storefront } = ctx;
  const { slug, quantity, algorithm = "DEFAULT" } = props;

  const headers = parseHeaders(req.headers);

  const { id: productId } = parseSlug(slug);

  const data = await storefront.query<
    ProductRecommendationsQuery,
    ProductRecommendationsQueryVariables
  >({
    variables: { quantity, productId, algorithm },
    ...ProductRecommendations,
  }, { headers });

  const products = data.productRecommendations;

  if (!Array.isArray(products)) {
    return null;
  }

  const productIDs = products.map((i) => i?.productId);

  const variations = props.getVariations
    ? await getVariations(storefront, productIDs, headers, url)
    : [];

  return products
    ?.filter((p): p is ProductFragment => Boolean(p))
    .map((variant) => {
      const productVariations = variations?.filter((v) =>
        v.inProductGroupWithID === variant.productId
      );

      return toProduct(variant, { base: url }, productVariations);
    });
};

export default productRecommendationsLoader;
