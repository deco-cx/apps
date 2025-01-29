import type { ProductDetailsPage } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import type { RequestURLParam } from "../../website/functions/requestToParam.ts";

interface Props {
  slug: RequestURLParam;
}

/**
 * @title PDP - Logicommerce Integration
 * @description Product Details Page loader
 */
const loader = async (
  { slug }: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const skuId = new URL(req.url).searchParams.get("skuId");

  const product = await ctx.api["GET /products/:id"](
    { id: slug },
    {
      headers: req.headers,
    },
  ).then((res) => res.json());

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product: toProduct(product, skuId),
    seo: {
      title: product.language?.name ?? "",
      description: product.language?.longDescription ?? "",
      canonical: product.language?.urlSeo ?? "",
    },
  };
};

export default loader;
