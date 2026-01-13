import type { Product } from "../../commerce/types.ts";
import { STALE } from "../../utils/fetch.ts";
import relatedProductsLoader from "../loaders/legacy/relatedProductsLoader.ts";
import productList from "../loaders/legacy/productList.ts";
import { AppContext } from "../mod.ts";
import { batch } from "./batch.ts";
import { getSegmentFromBag, withSegmentCookie } from "./segment.ts";
import { pickSku } from "./transform.ts";
import { toSegmentParams } from "./legacy.ts";

export const withIsSimilarTo = async (
  req: Request,
  ctx: AppContext,
  product: Product,
) => {
  const id = product.isVariantOf?.productGroupID;

  if (!id) {
    return product;
  }

  const isSimilarTo = await relatedProductsLoader(
    {
      crossSelling: "similars",
      id: product.inProductGroupWithID,
    },
    req,
    ctx,
  );

  return {
    ...product,
    isSimilarTo: isSimilarTo ?? undefined,
  };
};

interface CrossSellingResult {
  productId: string;
  skuIds: string[];
}

/**
 * Batched version of withIsSimilarTo that reduces productList API calls.
 *
 * Instead of calling productList once per product (N calls with ~3 IDs each),
 * this function:
 * 1. Makes all crossselling API calls in parallel
 * 2. Collects all unique SKU IDs from all results
 * 3. Makes a single batched productList call with all IDs
 * 4. Distributes the results back to each product
 *
 * This reduces ~N productList calls to just 1 (or a few if > 50 IDs).
 */
export const withIsSimilarToBatched = async (
  req: Request,
  ctx: AppContext,
  products: Product[],
): Promise<Product[]> => {
  const { vcsDeprecated } = ctx;
  const segment = getSegmentFromBag(ctx);
  const params = toSegmentParams(segment);

  // Filter products that have a valid productGroupID
  const productsWithIds = products.filter(
    (p) => p.isVariantOf?.productGroupID && p.inProductGroupWithID,
  );

  if (productsWithIds.length === 0) {
    return products;
  }

  // Step 1: Fetch all crossselling results in parallel
  const crossSellingPromises = productsWithIds.map(async (product) => {
    const productId = product.inProductGroupWithID!;
    try {
      const crossSellingProducts = await vcsDeprecated
        ["GET /api/catalog_system/pub/products/crossselling/:type/:productId"]({
          type: "similars",
          productId,
          ...params,
        }, { ...STALE, headers: withSegmentCookie(segment) })
        .then((res) => res.json());

      if (!Array.isArray(crossSellingProducts)) {
        return { productId, skuIds: [] } as CrossSellingResult;
      }

      const skuIds = crossSellingProducts.map((p) => pickSku(p).itemId);
      return { productId, skuIds } as CrossSellingResult;
    } catch {
      return { productId, skuIds: [] } as CrossSellingResult;
    }
  });

  const crossSellingResults = await Promise.all(crossSellingPromises);

  // Create a map of productId -> skuIds for later distribution
  const productToSimilarSkus = new Map<string, string[]>();
  for (const result of crossSellingResults) {
    productToSimilarSkus.set(result.productId, result.skuIds);
  }

  // Step 2: Collect all unique SKU IDs
  const allSkuIds = [
    ...new Set(crossSellingResults.flatMap((r) => r.skuIds)),
  ];

  if (allSkuIds.length === 0) {
    return products;
  }

  // Step 3: Fetch all similar products in batched productList calls (max 50 per call)
  const batchedIds = batch(allSkuIds, 50);
  const productListResults = await Promise.allSettled(
    batchedIds.map((ids) =>
      productList({ props: { similars: false, ids } }, req, ctx)
    ),
  );

  const allSimilarProducts = productListResults
    .filter(
      (result): result is PromiseFulfilledResult<Product[]> =>
        result.status === "fulfilled",
    )
    .flatMap((result) => result.value)
    .filter((x): x is Product => Boolean(x));

  productListResults
    .filter((result) => result.status === "rejected")
    .forEach((result, index) => {
      console.error(
        `Error loading similar products for batch ${index}:`,
        (result as PromiseRejectedResult).reason,
      );
    });

  // Step 4: Create a map of SKU ID -> Product for fast lookup
  const skuToProduct = new Map<string, Product>();
  for (const product of allSimilarProducts) {
    // Map by SKU ID
    const skuId = product.sku;
    if (skuId) {
      skuToProduct.set(skuId, product);
    }
    // Also map by product ID for fallback
    const productId = product.inProductGroupWithID;
    if (productId) {
      skuToProduct.set(`product:${productId}`, product);
    }
  }

  // Step 5: Distribute similar products back to each original product
  return products.map((product) => {
    const productId = product.inProductGroupWithID;
    if (!productId) {
      return product;
    }

    const similarSkuIds = productToSimilarSkus.get(productId);
    if (!similarSkuIds || similarSkuIds.length === 0) {
      return product;
    }

    const isSimilarTo = similarSkuIds
      .map((skuId) => skuToProduct.get(skuId))
      .filter((p): p is Product => Boolean(p));

    return {
      ...product,
      isSimilarTo: isSimilarTo.length > 0 ? isSimilarTo : undefined,
    };
  });
};
