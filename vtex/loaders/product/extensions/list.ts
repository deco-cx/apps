import { Product } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { extend, Options } from "../../../utils/extensions/mod.ts";

/**
 * @title VTEX Integration - Extra Info
 * @description Add extra data to your loader. This may harm performance
 */
const loader = (
  props: Options,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
(products: Product[] | null) =>
  Array.isArray(products) ? extend(products, props, req, ctx) : products;

export default loader;
