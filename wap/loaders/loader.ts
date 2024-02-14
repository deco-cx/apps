import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { WapProductsListPage } from "../utils/type.ts";
import { Props } from "./productListLastSeen.ts";

/**
 * @title Wap Integration - Last Seen
 * @description Last Seen Products list loader
 */
export const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;
  const { url: baseUrl } = req;

  const data = await api["GET /api/v2/front/showcase/products/ultimos-vistos"]({
    productId: String(props.productId),
    seenProducts: props.seenProducts.join(";"),
    limit: String(props.limit),
  }).then((response) => response.json()) as WapProductsShowcasePage;

  if (!data) return null;

  const rawProducts = data
    .produtos as WapProductsListPage["conteudo"]["produtos"];

  const products = rawProducts.map((produto) => toProduct(produto, baseUrl));

  return products;
};
