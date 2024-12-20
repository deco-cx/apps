import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import type { LogicommerceProductSorts } from "../types.ts";

/** @title {{{name}}} - {{{value}}} */
interface Filter {
  name: string;
  value: string;
}

interface Props {
  /** @description overides the query term */
  query?: string;
  /**
   * @title Items per page
   * @description number of products per page to display
   */
  count?: number;
  /** @description sort variable */
  sort?: LogicommerceProductSorts;
  filters?: Filter[];
}

/**
 * @title PLP - Logicommerce Integration
 * @description Product Listing Page loader
 */
const loader = (
  _props: Props,
  _req: Request,
  _ctx: AppContext,
): Promise<Product[] | null> => {
  throw new Error("Not implemented");
  // const { filters = [], ...params } = props

  // Object.assign(
  //     params,
  //     filters.reduce(
  //         (acc, filter) => {
  //             acc[filter.name] = filter.value
  //             return acc
  //         },
  //         {} as Record<string, string>,
  //     ),
  // )

  // const products = await ctx.api['GET /products'](params, { headers: req.headers }).then(res => res.json())

  // Deno.writeTextFileSync('products.json', JSON.stringify(products, null, 2))

  // return products.items?.map(toProduct) ?? []
};

export default loader;
