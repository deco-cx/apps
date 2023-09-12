import { ProductDetailsPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { toProductPage } from "../../shopify/utils/transform.ts";
import { gql } from "../../utils/graphql.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { fragment as productFragment } from "../utils/fragments/product.ts";
import { fragment as variantFragment } from "../utils/fragments/productVariant.ts";
import {
  GetProductQuery,
  GetProductQueryVariables,
} from "../utils/storefront.graphql.gen.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title Shopify Integration
 * @description Product Details Page loader
 */
const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { storefront } = ctx;
  const { slug } = props;

  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  const data = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables
  >({
    variables: { handle },
    fragments: [productFragment, variantFragment],
    query: gql`query GetProduct($handle: String) {
      product(handle: $handle) { ...Product }
    }`,
  });

  if (!data?.product) {
    return null;
  }

  return toProductPage(data.product, new URL(_req.url), maybeSkuId);
};

export default loader;
