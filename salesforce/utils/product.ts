import { AppContext } from "../../salesforce/mod.ts";
import { Basket, ProductSearch } from "./types.ts";
import getProducts from "./getProducts.ts";

export const getBasketImages = async (
  basket: Basket,
  ids: string[],
  ctx: AppContext,
): Promise<Basket> => {
  const productImages = await getProducts(
    { ids: ids, select: "(data.(imageGroups.(**),id))" },
    ctx,
  );

  return {
    ...basket,
    productItems: basket.productItems.map((item) => {
      const productImage = productImages!.data.find((image: { id: string }) =>
        image.id === item.productId
      );

      return {
        ...item,
        image: {
          alt: productImage?.imageGroups[0]?.images[0]?.alt || "",
          disBaseLink: productImage?.imageGroups[0]?.images[0]?.disBaseLink ||
            "",
          link: productImage?.imageGroups[0]?.images[0]?.link || "",
          title: productImage?.imageGroups[0]?.images[0]?.title || "",
        },
      };
    }),
  };
};

export const getImages = async (
  ids: string[],
  ctx: AppContext,
): Promise<ProductSearch | null> => {
  const productImages = await getProducts(
    { ids: ids, select: "(data.(imageGroups.(**),id))" },
    ctx,
  );
  if (productImages) return productImages;

  return null;
};

export default getBasketImages;
