import { Product, ProductLeaf } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { withIsSimilarTo } from "../similars.ts";
import { extension as simulateExt } from "./simulation.ts";
import listLoader from "../../loaders/legacy/productList.ts";
import { batch } from "../batch.ts";

export interface Options {
  simulate?: boolean;
  similars?: boolean;
  kitItems?: boolean;
  variants?: boolean;
}

const similarsExt = (
  products: Product[],
  req: Request,
  ctx: AppContext,
) => Promise.all(products.map((p) => withIsSimilarTo(req, ctx, p)));

const kitItemsExt = async (
  products: Product[],
  req: Request,
  ctx: AppContext,
): Promise<Product[]> => {
  const productIDs = new Set<string>();

  for (const product of products) {
    for (const item of product.isAccessoryOrSparePartFor || []) {
      productIDs.add(item.productID);
    }
  }

  const batched = await Promise.all(
    batch(productIDs.values(), 10).map((batch) =>
      listLoader({ props: { ids: batch } }, req, ctx)
    ),
  );

  const productsById = new Map<string, ProductLeaf>();
  for (const batch of batched) {
    for (const product of batch || []) {
      for (const leaf of product.isVariantOf?.hasVariant || []) {
        productsById.set(leaf.productID, leaf);
      }
    }
  }

  return products.map((p) => ({
    ...p,
    isAccessoryOrSparePartFor: p.isAccessoryOrSparePartFor
      ?.map((p) => productsById.get(p.productID))
      .filter((p): p is ProductLeaf => Boolean(p)),
  }));
};

const variantsExt = async (
  products: Product[],
  req: Request,
  ctx: AppContext,
): Promise<Product[]> => {
  const productIDs = new Set<string>();

  for (const product of products) {
    productIDs.add(product.productID);
  }

  const batched = await Promise.all(
    batch(productIDs.values(), 15).map((batch) =>
      listLoader({ props: { ids: batch } }, req, ctx)
    ),
  );

  const productsById = new Map<string, Product>();
  for (const batch of batched) {
    for (const product of batch || []) {
      productsById.set(product.productID, product);
    }
  }

  return products.map((p) => ({
    ...productsById.get(p.productID),
    ...p,
    isVariantOf: productsById.get(p.productID)?.isVariantOf,
  }));
};

export const extend = async (
  products: Product[],
  { simulate, similars, kitItems, variants }: Options,
  req: Request,
  ctx: AppContext,
) => {
  let p = products;

  if (variants) {
    p = await variantsExt(p, req, ctx);
  }

  if (kitItems) {
    p = await kitItemsExt(p, req, ctx);
  }

  if (similars) {
    p = await similarsExt(p, req, ctx);
  }

  if (simulate) {
    p = await simulateExt(p, req, ctx);
  }

  return p;
};
