import type { ProductDetailsPage } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { parseSlug, toProduct } from "../utils/transform.ts";

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

  const maybeProduct = await api["GET /api/v2/products/:id"]({
    id,
    include_images: "true",
  }, STALE)
    .then((r) => r.json()).catch(() => null);

  // 404: product not found
  if (!maybeProduct) {
    return null;
  }

  const product = toProduct(maybeProduct, variantId, {
    url,
    priceCurrency: "BRL",
  });

  const segments = url.pathname.slice(1).split("/");

  return {
    "@type": "ProductDetailsPage",
    // TODO: Find out what's the right breadcrumb on vnda
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: segments.map((s, i) => ({
        "@type": "ListItem",
        name: s,
        position: i + 1,
        item: new URL(`/${segments.slice(0, i + 1).join("/")}`, url).href,
      })),
      numberOfItems: segments.length,
    },
    product,
    seo: {
      title: product.name ?? "",
      description: product.description ?? "",
      canonical: new URL(`/${segments.join("/")}`, url).href,
    },
  };
}

export default loader;
