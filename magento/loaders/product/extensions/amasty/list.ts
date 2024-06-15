import { AppContext } from "../../../../mod.ts";
import extend, { Props } from "../extend.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";
import { Product } from "../../../../../commerce/types.ts";

/**
 * @title Magento Extension - List
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Omit<Props, "products">,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
async (products: Product[] | null) =>
  Array.isArray(products)
    ? await extend({ products, ...props }, req, ctx)
    : products;

export default loader;
