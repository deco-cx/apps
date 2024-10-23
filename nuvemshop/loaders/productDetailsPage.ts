import type { ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";

import { getBreadCrumbs, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title NuvemShop Integration - Product Details Page
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const { api, storeId } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const url = new URL(baseUrl);

  const sku = url.searchParams.get("sku");

  const nuvemProductResponse = await api["GET /v1/:storeId/products"]({
    storeId: storeId,
    handle: slug,
  });

  const nuvemProduct = await nuvemProductResponse.json();

  // Product not found, return the 404 status code
  if (!nuvemProduct) {
    return null;
  }

  const defaultProduct = nuvemProduct[0].variants[0];
  const productBySku = nuvemProduct[0].variants.filter((variant) =>
    variant.sku === sku || variant.id.toString() === sku
  );
  const product = toProduct(
    productBySku[0] || defaultProduct,
    nuvemProduct[0],
    new URL(url),
    0,
  );

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: getBreadCrumbs(nuvemProduct[0]),
      numberOfItems: nuvemProduct[0].categories.length + 1,
    },
    product,
  };
}

export default loader;
