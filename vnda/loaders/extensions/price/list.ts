import { Product } from "../../../../commerce/types.ts";
import { ExtensionOf } from "../../../../website/loaders/extension.ts";
import { AppContext } from "../../../mod.ts";
import { fetchAndApplyPrices } from "../../../utils/transform.ts";

export interface Props {
  priceCurrency: string;
}

const loader = (
  { priceCurrency }: Props,
  req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> =>
(products: Product[] | null) => {
  if (!Array.isArray(products)) return products;

  return fetchAndApplyPrices(products, priceCurrency, req, ctx);
};

export default loader;
