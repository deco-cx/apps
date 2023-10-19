import type { ProductDetailsPage } from "../../commerce/types.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { GetProduct } from "../utils/graphql/queries.ts";
import {
  GetProductQuery,
  GetProductQueryVariables,
} from "../utils/graphql/storefront.graphql.gen.ts";
import { parseSlug, toBreadcrumbList, toProduct } from "../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title Wake Integration
 * @description Product Details Page loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<ProductDetailsPage | null> {
  const url = new URL(req.url);
  const { slug } = props;
  const { storefront } = ctx;

  if (!slug) return null;

  // const variantId = Number(url.searchParams.get("skuId")) || null;
  const { id: productId } = parseSlug(slug);

  if (!productId) {
    throw new Error("Missing product id");
  }

  const { product: wakeProduct } = await storefront.query<
    GetProductQuery,
    GetProductQueryVariables
  >({
    variables: { productId },
    ...GetProduct,
  });

  if (!wakeProduct) {
    return null;
  }

  console.log(wakeProduct);

  const product = toProduct(wakeProduct, { base: url });

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: toBreadcrumbList(product, wakeProduct.productCategories, {
      base: url,
    }),
    product,
    seo: {
      canonical: product.isVariantOf?.url ?? "",
      title: wakeProduct.productName ?? "",
      description:
        wakeProduct.seo?.find((m) => m?.name === "description")?.content ?? "",
    },
  };
}

export default loader;
