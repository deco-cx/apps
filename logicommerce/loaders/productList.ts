import type { Product } from "../../commerce/types.ts";
import type { AppContext } from "../mod.ts";
import type { LogicommerceProductSorts } from "../types.ts";
import { toProduct } from "../utils/transform.ts";

/** @title {{{name}}}={{{value}}} */
interface FilterParam {
  name: string;
  value: string;
}

interface Props {
  /**
   * @title query
   * @description query to use on search
   */
  q?: string;
  /** @description total number of items to display */
  count?: number;
  /** @description sort variable */
  sort?: LogicommerceProductSorts;
  /** @description (DON'T USE FILTERS WITH SAME NAME, like filterOption[size]=01, filterOption[size]=02), use any param from "https://devcenter.logicommerce.com/apiCore/359#operation/getProducts" */
  filters?: FilterParam[];
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
  // You can't use filters with same type, like, filterOption[size]=01 and filterOption[size]=02
  // It will become filterOption[size]=02
  // It occurs because `createHttpClient` accepts only object as params
  // And you can't have two keys with the same name in an object
  const customFilters = Object.fromEntries(
    props.filters?.map(({ name, value }) => [name, value]) ?? [],
  );

  const products = await ctx.api["GET /products"](
    { ...props, ...customFilters },
    {
      headers: req.headers,
    },
  ).then((res) => res.json());

  return products.items?.slice(0, props.count ?? 10).map((p) => toProduct(p)) ??
    [];
};

export default loader;
