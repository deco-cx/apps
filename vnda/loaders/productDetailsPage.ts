import type { ProductDetailsPage } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { getSEOFromTag, parseSlug, toProduct } from "../utils/transform.ts";

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
  const { api } = ctx;

  if (!slug) return null;

  const variantId = url.searchParams.get("skuId") || null;
  const { id } = parseSlug(slug);

  const [maybeProduct, seo] = await Promise.all([
    api["GET /api/v2/products/:id"]({ id, include_images: "true" }, STALE)
      .then((r) => r.json()).catch(() => null),
    api["GET /api/v2/seo_data"]({
      resource_type: "Product",
      resource_id: id,
      type: "category",
    }, STALE).then((res) => res.json()),
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
