import { Product } from "../../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../../website/loaders/extension.ts";
import { AppContext } from "../../../../mod.ts";
import { simulationOffer } from "../../../../utils/simulation.ts";

/**
 * @title VTEX Integration - Simulation
 * @description Enables PriceTables/Sales Channel support for products
 */
const loader = (
  _props: unknown,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
(products: Product[] | null) =>
  Array.isArray(products) ? simulationOffer(products, req, ctx) : products;

export default loader;
