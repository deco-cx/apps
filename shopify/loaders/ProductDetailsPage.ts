import { ProductDetailsPage } from "../../commerce/types.ts";
import { AppContext } from "../../shopify/mod.ts";
import { toProductPage } from "../../shopify/utils/transform.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { Data, query, Variables } from "../utils/queries/product.ts";

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

  const data = await storefront.query<Data, Variables>({
    query,
    variables: { handle },
  });

  if (!data?.product) {
    return null;
  }

  return toProductPage(data.product, new URL(_req.url), maybeSkuId);
};

export default loader;
