import { Product } from "../../commerce/types.ts";
import { AppContext } from "../mod.ts";
import { toProduct } from "../utils/transform.ts";
import { WapProductsShowcasePage } from "../utils/type.ts";

export type Props = {
  productId: number;
  seenProducts: number[];
  limit: number;
};

/**
 * @title Wap Integration - Last Seen
 * @description Last Seen Products list loader
 */
const loader = async (
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

  const rawProducts = data.produtos;

  const products = rawProducts.map((produto) => toProduct(produto, baseUrl));

  return products;
};

export default loader;
