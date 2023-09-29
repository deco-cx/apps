import type { Product } from "../../commerce/types.ts";
import { toProduct } from "../utils/transform.ts";
import { AppContext } from "../mod.ts";

export interface Props {
  /** @description total number of items to display */
  count: number;
}

/**
 * @title Random Products
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { randomApi } = ctx;

  const count = props.count ?? 12;

  const beers = await randomApi["GET /api/v2/beers"]({ size: count }).then((
    r,
  ) => r.json());

  const products = beers.map((beer) => toProduct(beer, new URL(req.url)));

  return products ?? [];
};

export default loader;
