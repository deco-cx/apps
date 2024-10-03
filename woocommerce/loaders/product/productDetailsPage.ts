import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import type { ProductDetailsPage } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { toBreadcrumbList, toProduct } from "../../utils/transform.ts";

export interface Props {
  slug: RequestURLParam;
}

async function loader(
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> {
  const { slug } = props;
  const { api } = ctx;

  if (!slug) return null;

  const [product] = await api["GET /wc/v3/products"]({
    slug,
  }).then((res) => res.json());

  if (!product) return null;

  return {
    "@type": "ProductDetailsPage",
    product: toProduct(product),
    breadcrumbList: toBreadcrumbList(product.categories),
    seo: {
      title: product.name,
      description: product.short_description || product.description,
      canonical: product.slug,
    },
  };
}

export default loader;
