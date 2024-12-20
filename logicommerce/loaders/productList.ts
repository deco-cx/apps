import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import type { LogicommerceProductSorts } from "../types.ts";
import { toProduct } from "../utils/transform.ts";

/** @title {{{name}}} - {{{value}}} */
interface Filter {
  name: string;
  value: string;
}

interface Props {
  /** @description query to use on search */
  query?: string;
  /** @description total number of items to display */
  count?: number;
  /** @description sort variable */
  sort?: LogicommerceProductSorts;
  filters?: Filter[];
}

/**
 * @title Shelf - Logicommerce Integration
 * @description Product List loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> => {
  const { filters = [], ...params } = props;

  Object.assign(
    params,
    filters.reduce(
      (acc, filter) => {
        acc[filter.name] = filter.value;
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  const products = await ctx.api["GET /products"](params, {
    headers: req.headers,
  }).then((res) => res.json());

  Deno.writeTextFileSync("products.json", JSON.stringify(products, null, 2));

  return products.items?.map(toProduct) ?? [];
};

export default loader;
