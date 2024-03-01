import { Product } from "../../commerce/types.ts";
import { RequestURLParam } from "../../website/functions/requestToParam.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import {
  WapProductDatailsPage,
  WapProductsShowcasePage,
} from "../utils/type.ts";

export interface Dynamic {
  slug: RequestURLParam;
}

export interface Static {
  productId: number;
}

export type Props = { props: Static | Dynamic };

// deno-lint-ignore no-explicit-any
const isDynamic = (p: any): p is Dynamic => typeof p.slug === "string";

/**
 * @title Wap Integration - Indicated Products
 * @description Indicated Products loader
 */
const loader = async (
  { props }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;

  let productId = (props as Static)?.productId;

  if (isDynamic(props)) {
    const wapProduct = await api
      ["GET /api/v2/front/url/product/detail"]({
        url: `/${props.slug}.html`,
      }).then((response) => response.json()) as WapProductDatailsPage;

    if (!wapProduct) return null;

    productId = wapProduct.conteudo.id;
  }

  const data = await api
    ["GET /api/v2/front/showcase/products/produto-detalhe-indicados"]({
      productId: String(productId),
    }).then((response) => response.json()) as WapProductsShowcasePage;

  if (!data) return null;

  const rawProducts = data.produtos;

  const products = rawProducts.map((produto) => toProduct(produto, baseUrl));

  return products;
};

export default loader;
