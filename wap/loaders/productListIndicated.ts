import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { WapProductsShowcasePage } from "../utils/type.ts";
import { WapProductsListPage } from "../utils/type.ts";

export type Props = { productId: number };

/**
 * @title Wap Integration - Indicated Products
 * @description Indicated Products loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;

  const data = await api
    ["GET /api/v2/front/showcase/products/produto-detalhe-indicados"]({
      productId: String(props.productId),
    }).then((response) => response.json()) as WapProductsShowcasePage;

  if (!data) return null;

  const rawProducts = data
    .produtos as WapProductsListPage["conteudo"]["produtos"];

  const products = rawProducts.map((produto) => toProduct(produto, baseUrl));

  return products;
};

export default loader;
