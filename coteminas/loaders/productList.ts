import { AppContext } from "../mod.ts";
import type { Product } from "../../commerce/types.ts";
import { toProduct } from "../utils/transform.ts";

export interface Props {
  /**
   * @description Category name
   */
  category: string;

  /**
   * @description Quantity of items
   */
  count: number;
}

/**
 * @title Coteminas Integration
 * @description Product List loader
 */
const productListLoader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { api } = ctx;

  const { count = 8 } = props;

  const response = await api
    ["GET /api/product-catalog/resolve-route?path=/vm/:category"]({
      category: props.category,
      page: "",
    }).then((res) => res.json());

  const url = new URL(`https://${ctx.account}.com.br/`);

  const products = response.productCards.slice(0, count).map((product) => {
    return toProduct(product, url);
  });

  return products;
};

export default productListLoader;
