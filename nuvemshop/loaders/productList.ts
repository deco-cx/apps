import type { Product } from "../../commerce/types.ts";
import { toProduct } from "../utils/transform.ts";
import { NuvemShopSort, ProductBaseNuvemShop } from "../utils/types.ts";

export interface Props {
  /** @description query to use on search. if used will break sort */
  term?: string;

  /** @description total number of items to display */
  limit: number;

  /** @description search sort parameter */
  sort?: NuvemShopSort;
}

/**
 * @title NuvemShop Integration - Search products
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const { api } = ctx;
  const { url } = req;

  let result: ProductBaseNuvemShop[] | undefined;

  try {
    const response = await api["GET /products"]({
      q: props.term || "",
      sort_by: props.sort || "user",
      per_page: props.limit || 10,
    });
    result = await response.json();
  } catch {
    result = [];
  }

  const products = result?.map((product) => {
    return [...toProduct(product, new URL(url), null)];
  }).flat();

  return products || [];
}

export default loader;
