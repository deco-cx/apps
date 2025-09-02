import type { Product } from "../../commerce/types.ts";
import { handleAuthError } from "../utils/authError.ts";
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
import { getPartnerCookie } from "../utils/partner.ts";

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
  const partnerAccessToken = getPartnerCookie(req.headers);

  const headers = parseHeaders(req.headers);

  const { id: productId } = parseSlug(slug);

  let data: ProductRecommendationsQuery | undefined;
  try {
    data = await storefront.query<
      ProductRecommendationsQuery,
      ProductRecommendationsQueryVariables
    >({
      variables: { quantity, productId, algorithm, partnerAccessToken },
      ...ProductRecommendations,
    }, { headers });
  } catch (error: unknown) {
    handleAuthError(error, "load product recommendations");
  }

  const products = data?.productRecommendations;

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

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, _ctx: AppContext) => {
  // Avoid cross-tenant cache bleed when a partner token is present
  if (getPartnerCookie(req.headers)) {
    return null;
  }

  const params = new URLSearchParams([
    ["slug", String(props.slug)],
    ["quantity", String(props.quantity)],
    ["algorithm", props.algorithm],
    ["getVariations", String(props.getVariations ?? false)],
  ]);

  const url = new URL(req.url);
  url.search = params.toString();
  return url.href;
};

export default productRecommendationsLoader;
