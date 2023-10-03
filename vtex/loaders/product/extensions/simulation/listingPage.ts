import { ProductListingPage } from "../../../../../commerce/types.ts";
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
): ExtensionOf<ProductListingPage | null> =>
async (page: ProductListingPage | null) => {
  if (page == null) {
    return page;
  }

  return {
    ...page,
    products: await simulationOffer(page.products, req, ctx),
  };
};

export default loader;
