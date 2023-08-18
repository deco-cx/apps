import { ProductDetailsPage } from "apps/commerce/types.ts";
import { AppContext } from "apps/shopify/mod.ts";
import { toProductPage } from "apps/shopify/utils/transform.ts";
import type { RequestURLParam } from "apps/website/functions/requestToParam.ts";

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
  const { client } = ctx;
  const { slug } = props;

  const splitted = slug?.split("-");
  const maybeSkuId = Number(splitted[splitted.length - 1]);

  const handle = splitted.slice(0, maybeSkuId ? -1 : undefined).join("-");

  // search products on Shopify. Feel free to change any of these parameters
  const data = await client.product(handle);

  if (!data?.product) {
    return null;
  }

  return toProductPage(data.product, new URL(_req.url), maybeSkuId);
};

export default loader;
