import { ProductListingPage } from "../../../../commerce/types.ts";
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
): ExtensionOf<ProductListingPage | null> =>
async (props: ProductListingPage | null) => {
  if (!props) return props;

  const { products, ...page } = props;

  if (!Array.isArray(products)) return props;

  const extendedProducts = await fetchAndApplyPrices(
    products,
    priceCurrency,
    req,
    ctx,
  );

  return {
    ...page,
    products: extendedProducts,
  };
};

export default loader;
