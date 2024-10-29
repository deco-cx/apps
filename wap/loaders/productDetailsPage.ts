import { ProductDetailsPage } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { getUrl, toBreadcrumbList, toProduct } from "../utils/transform.ts";
import { WapProductDatailsPage } from "../utils/type.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title Wap Integration
 * @description Product Details loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;
  const url = new URL(baseUrl);

  const {
    slug,
  } = props;

  const data = await api
    ["GET /api/v2/front/url/product/detail"]({
      url: `/${slug}.html`,
    }).then((response) => response.json()) as WapProductDatailsPage;

  const itemListElement = toBreadcrumbList(data.estrutura.breadcrumb, baseUrl);

  const product = toProduct(data.conteudo, baseUrl);

  return {
    "@type": "ProductDetailsPage",
    breadcrumbList: {
      "@type": "BreadcrumbList",
      itemListElement,
      numberOfItems: itemListElement.length,
    },
    product,
    seo: {
      title: data.estrutura.seo.title,
      description: data.estrutura.seo.description,
      canonical:
        getUrl(new URL(data.estrutura.seo.canonical).pathname, url.origin).href,
      noIndexing: !data.estrutura.seo.indexar,
    },
  };
};

export default loader;
