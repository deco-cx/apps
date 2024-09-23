import { Product, ProductLeaf } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { batch } from "../../utils/batch.ts";
import { extension as simulateExt } from "../../utils/extensions/simulation.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toInventories, toReview } from "../../utils/transform.ts";
import listLoader from "../legacy/productList.ts";

export interface Props {
  simulate?: boolean;
  similars?: boolean;
  kitItems?: boolean;
  variants?: boolean;
  reviews?: boolean;
  inventory?: boolean;
  /**
   * @description Adds brand information to products, useful for Intelligent Search loaders.
   */
  brands?: boolean;
  

  products: Product[];
}

const brandsExt = async (
  products: Product[],
  ctx: AppContext,
) => {
  const brands = await ctx.invoke.vtex.loaders.legacy.brands();

  if (!brands || !brands.length) {
    return products;
  }

  return products.map((p) => ({
    ...p,
    brand: brands.find((b) => b["@id"] === p.brand?.["@id"]) || p.brand,
  }));
};

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
      if (product) {
        productsById.set(product.productID, product);
      }
    }
  }

  return products.map((p) => ({
    ...productsById.get(p.productID),
    ...p,
    isVariantOf: productsById.get(p.productID)?.isVariantOf,
  }));
};

const reviewsExt = async (
  products: Product[],
  ctx: AppContext,
): Promise<Product[]> => {
  const reviewPromises = products.map((product) =>
    ctx.my["GET /reviews-and-ratings/api/reviews"]({
      product_id: product.inProductGroupWithID ?? "",
      search_term: "",
      from: "0",
      to: "10",
      order_by: "",
      status: true,
    }).then((res) => res.json())
      .catch(() => ({}))
  );

  const ratingPromises = products.map((product) =>
    ctx.my["GET /reviews-and-ratings/api/rating/:inProductGroupWithId"]({
      inProductGroupWithId: product.inProductGroupWithID ?? "",
    }).then((res) => res.json())
      .catch(() => ({}))
  );

  const reviewsPromise = Promise.all(reviewPromises);
  const ratingsPromise = Promise.all(ratingPromises);

  const [reviews, ratings] = await Promise.all([
    reviewsPromise,
    ratingsPromise,
  ]);

  return toReview(products, ratings, reviews);
};

const inventoryExt = async (
  products: Product[],
  ctx: AppContext,
): Promise<Product[]> => {
  const inventoriesPromises = products.map((product) =>
    ctx.vcs["GET /api/logistics/pvt/inventory/skus/:skuId"]({
      skuId: product.inProductGroupWithID ?? "",
    }).then((res) => res.json())
      .catch(() => ({}))
  );

  const inventoriesPromise = Promise.all(inventoriesPromises);

  const [inventories] = await Promise.all([
    inventoriesPromise,
  ]);

  return toInventories(products, inventories);
};

export const cache = "no-cache";

export default async (
  {
    products,
    variants,
    kitItems,
    similars,
    simulate,
    reviews,
    inventory,
    brands,
  }: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[]> => {
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
    p = await simulateExt(p, ctx);
  }

  if (reviews) {
    p = await reviewsExt(p, ctx);
  }

  if (inventory) {
    p = await inventoryExt(p, ctx);
  }

  if (brands) {
    p = await brandsExt(p, ctx);
  }

  return p;
};
