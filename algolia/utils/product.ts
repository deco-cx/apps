import { SearchIndex } from "npm:algoliasearch@4.20.0";
import { Product } from "../../commerce/types.ts";

const unique = (ids: string[]) => [...new Set(ids).keys()];

export const resolveProducts = async (
  products: Product[],
  index: SearchIndex,
) => {
  const hasVariantIds = products.flatMap((p) =>
    p.isVariantOf?.hasVariant.map((x) => x.productID)
  );
  const isSimilarToIds = products.flatMap((p) =>
    p.isSimilarTo?.map((x) => x.productID)
  );

  const ids = [
    ...hasVariantIds,
    ...isSimilarToIds,
  ].filter((x): x is string => typeof x === "string");

  const [{ results: similars }] = await Promise.all([
    index.getObjects<Product>(unique(ids)),
  ]);

  const productsById = new Map<string, Product>();
  for (const product of similars) {
    product && productsById.set(product.productID, product);
  }

  return products.map((p) => ({
    ...p,
    isVariantOf: p.isVariantOf && {
      ...p.isVariantOf,
      hasVariant: p.isVariantOf?.hasVariant
        .map((p) => productsById.get(p.productID))
        .filter((p): p is Product => Boolean(p)),
    },
    isSimilarTo: p.isSimilarTo
      ?.map((p) => productsById.get(p.productID))
      .filter((p): p is Product => Boolean(p)),
  }));
};
