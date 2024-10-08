import { ProductDetailsPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { toProductPage } from "../../shopify/utils/transform.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import {
  GetProductQuery,
  GetProductQueryVariables,
  HasMetafieldsMetafieldsArgs,
} from "../utils/storefront/storefront.graphql.gen.ts";
import { GetProduct } from "../utils/storefront/queries.ts";
import { Metafield } from "../utils/types.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @title Metafields
   * @description search for metafields
   */
  metafields?: Metafield[];
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
  const metafields = props.metafields || [];

  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  const data = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables & HasMetafieldsMetafieldsArgs
  >({
    variables: { handle, identifiers: metafields },
    ...GetProduct,
  });

  if (!data?.product) {
    return null;
  }

  return toProductPage(data.product, new URL(_req.url), maybeSkuId);
};

export const cache = "no-cache";
export const cacheKey = (props: Props, req: Request): string => {
  const { slug } = props;
  const searchParams = new URLSearchParams({
    slug,
  });

  const url = new URL(req.url);
  url.search = searchParams.toString();
  return url.href;
};

export default loader;
