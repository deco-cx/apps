import type { ProductListingPage, Product } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { Props } from "./productListingPage.ts";

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<ProductListingPage | null> => {

  const response = await ctx.invoke.vtex.loaders.intelligentSearch.productListingPage(
    props,
  );

  if (!response) {
    return null;
  }

  const reducedProducts: Product[] = response.products?.map((product) => ({
    "@type": product["@type"],
    url: product.url,
    productID: product.productID,
    name: product.name,
    image: product.image,
    isVariantOf: product.isVariantOf,
    advertisement: product?.advertisement,
  })) || [];

  const newProductRes: ProductListingPage = {
    ...response,
    products: reducedProducts,
  };

  return newProductRes;
};

export default loader;
