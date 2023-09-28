import type { Product } from "../../commerce/types.ts";
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
  _req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { randomApi } = ctx;

  const count = props.count ?? 12;

  const beers = await randomApi["GET /api/v2/beers"]({ size: count }).then((r) =>
    r.json()
  );

  console.log({ beers })

  const products = await Promise.resolve([]);

  return products ?? [];
};

export default loader;
