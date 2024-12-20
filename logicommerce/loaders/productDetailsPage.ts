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
  const products = await ctx.api["GET /products/:id"]({ id: slug }, {
    headers: req.headers,
  }).then((res) => res.json());

  Deno.writeTextFileSync("products.json", JSON.stringify(products, null, 2));

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement: [],
      numberOfItems: 0,
    },
    product: toProduct(products),
    seo: {
      title: products.language?.name ?? "",
      description: products.language?.longDescription ?? "",
      canonical: products.language?.urlSeo ?? "",
    },
  };
};

export default loader;
