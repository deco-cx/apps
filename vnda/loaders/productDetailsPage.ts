import type { ProductDetailsPage } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { ProductPrice } from "../utils/client/types.ts";
import { parseSlug, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
  priceIntl?: boolean;
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
  const { slug, priceIntl = false } = props;
  const { api } = ctx;

  if (!slug) return null;

  const variantId = url.searchParams.get("skuId") || null;
  const fromSlug = parseSlug(slug);

  // 404: invalid slug
  if (!fromSlug) {
    return null;
  }

  const { id } = fromSlug;

  const getMaybeProduct = async (id: number) => {
    try {
      const result = await api["GET /api/v2/products/:id"]({
        id,
        include_images: "true",
        include_inventory_place: "true",
      }, STALE);
      return result.json();
    } catch (error) {
      // Make async rendering work
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      return null;
    }
  };

  // Since the Product by ID request don't return the INTL price, is necessary to search all prices and replace them
  const getProductPrice = async (id: number): Promise<ProductPrice | null> => {
    if (!priceIntl) {
      return null;
    } else {
      try {
        const result = await api["GET /api/v2/products/:productId/price"]({
          productId: id,
        }, STALE);
        return result.json();
      } catch (error) {
        // Make async rendering work
        if (error instanceof DOMException && error.name === "AbortError") {
          throw error;
        }

        return null;
      }
    }
  };

  const [maybeProduct, productPrice] = await Promise.all([
    getMaybeProduct(id),
    getProductPrice(id),
  ]);

  const variantsLength = maybeProduct?.variants?.length ?? 0;

  // 404: product not found
  if (!maybeProduct || variantsLength === 0) {
    return null;
  }

  const product = toProduct(maybeProduct, variantId, {
    url,
    priceCurrency: "BRL",
    productPrice,
  });

  const segments = url.pathname.slice(1).split("/");

  let seoArray;
  if (product.isVariantOf?.productGroupID) {
    seoArray = await api["GET /api/v2/seo_data"]({
      resource_type: "Product",
      resource_id: Number(product.isVariantOf.productGroupID),
    }, STALE).then((res) => res.json())
      .catch(() => undefined);
  }

  const seo = seoArray?.at(-1);

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
      title: seo?.title || (product.name ?? ""),
      description: seo?.description || (product.description ?? ""),
      canonical: new URL(`/${segments.join("/")}`, url).href,
    },
  };
}

export default loader;

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request) => {
  const url = new URL(req.url);
  const { slug, priceIntl = false } = props;

  if (!slug) return null;

  const variantId = url.searchParams.get("skuId") || "";

  return `product-details-page-${slug}-${priceIntl}-${variantId}`;
};
