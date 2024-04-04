import { Product, ProductLeaf } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { batch } from "../../utils/batch.ts";
import { extension as simulateExt } from "../../utils/extensions/simulation.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { toReview } from "../../utils/transform.ts";
import listLoader from "../legacy/productList.ts";

export interface Props {
  simulate?: boolean;
  similars?: boolean;
  kitItems?: boolean;
  variants?: boolean;
  reviews?: boolean;

  products: Product[];
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

const reviewsExt = async (
  products: Product[],
  ctx: AppContext,
): Promise<Product[]> => {
  const reviewPromises = products.map((product) =>
    ctx.my["GET /reviews-and-ratings/api/reviews"]({
      product_id: product.inProductGroupWithID,
    }).then((res) => res.json())
  );

  const ratingPromises = products.map((product) =>
    ctx.my["GET /reviews-and-ratings/api/rating/:inProductGroupWithId"]({
      inProductGroupWithId: product.inProductGroupWithID ?? "",
    }).then((res) => res.json())
  );

  const reviewsPromise = Promise.all(reviewPromises);
  const ratingsPromise = Promise.all(ratingPromises);

  const [reviews, ratings] = await Promise.all([
    reviewsPromise,
    ratingsPromise,
  ]);

  return toReview(products, ratings, reviews);
};

export default async (
  {
    products,
    variants,
    kitItems,
    similars,
    simulate,
    reviews,
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

  return p;
};

export { cache, cacheKey } from "../../utils/cacheBySegment.ts";
