import { AppContext } from "../../mod.ts";
import { toProductPage } from "../../utils/transform.ts";
import type { ProductDetailsPage } from "../../../commerce/types.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { getSession } from "../../utils/session.ts";

export interface Props {
  slug: RequestURLParam;
  id: RequestURLParam;
}

/**
 * @title Salesforce Product Details Page
 * @description works on routes /:slug/p?id=optionalProductId
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const session = getSession(ctx);

  const { slug, id } = props;
  const variantId = url.searchParams.get("skuId") ?? "";
  const { slc, organizationId, siteId } = ctx;

  if (!slug && !id) return null;

  const getProductById = await slc
    ["GET /product/shopper-products/v1/organizations/:organizationId/products/:id"](
      {
        organizationId,
        siteId,
        id,
        allImages: true,
      },
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      },
    );

  const productResult = await getProductById.json();
  const newProduct = toProductPage(productResult, url.origin, variantId);
  return newProduct;
}
