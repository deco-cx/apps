import type { ProductDetailsPage } from "apps/commerce/types.ts";
import { AppContext } from "apps/vnda/mod.ts";
import {
  getSEOFromTag,
  parseSlug,
  toProduct,
} from "apps/vnda/utils/transform.ts";
import type { RequestURLParam } from "apps/website/functions/requestToParam.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title VNDA Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug } = props;
  const { client } = ctx;

  if (!slug) return null;

  const variantId = url.searchParams.get("skuId") || null;
  const { id } = parseSlug(slug);

  const [maybeProduct, seo] = await Promise.all([
    client.product.get(id),
    client.seo.product(id),
  ]);

  // 404: product not found
  if (!maybeProduct) {
    return null;
  }

  const product = toProduct(maybeProduct, variantId, {
    url,
    priceCurrency: "BRL",
  });

  return {
    "@type": "ProductDetailsPage",
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product,
    seo: getSEOFromTag({
      title: product.name,
      description: product.description || "",
      ...seo?.[0],
    }, req),
  };
}

export default loader;
