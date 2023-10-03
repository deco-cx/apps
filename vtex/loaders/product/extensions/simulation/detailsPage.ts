import { ProductDetailsPage } from "../../../../../commerce/types.ts";
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
): ExtensionOf<ProductDetailsPage | null> =>
async (page: ProductDetailsPage | null) => {
  if (page == null) {
    return page;
  }

  const { product } = page;

  const products = await simulationOffer([product], req, ctx);

  return {
    ...page,
    product: products[0],
  };
};

export default loader;
