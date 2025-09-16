import type { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { batch } from "../../utils/batch.ts";
import { isFilterParam, toSegmentParams } from "../../utils/legacy.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { pickSku, toProduct } from "../../utils/transform.ts";
import type { CrossSellingType } from "../../utils/types.ts";
import productList from "./productList.ts";

export interface Props {
  /**
   * @title Related Productss
   * @description VTEX Cross Selling API. This loader only works on routes of type /:slug/p
   */
  crossSelling: CrossSellingType;
  /**
   * @description: number of related products
   */
  count?: number;
  /**
   * @description the product slug
   */
  slug?: RequestURLParam;
  /**
   * @description ProductGroup ID
   */
  id?: string;
  /**
   * @description remove unavailable items from result. This may result in slower websites
   */
  hideUnavailableItems?: boolean;
}

/**
 * @title Related Products
 * @description List related products, commonly used for additional shelves, features like: show similars or buy together.
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const { vcsDeprecated } = ctx;
  const {
    hideUnavailableItems,
    crossSelling = "similars",
    count,
  } = props;
  const segment = getSegmentFromBag(ctx);
  const params = toSegmentParams(segment);

  const getProductGroupID = async (props: { slug?: string; id?: string }) => {
    const { id, slug } = props;

    if (id) {
      return id;
    }

    if (slug) {
      const pageType = await vcsDeprecated
        ["GET /api/catalog_system/pub/portal/pagetype/:term"]({
          term: `${slug}/p`,
        }, STALE).then((res) => res.json());

      // Page type doesn't exists or this is not product page
      if (pageType?.pageType === "Product") {
        return pageType.id;
      }
    }

    return null;
  };

  const productId = await getProductGroupID(props);

  if (!productId) {
    console.warn(`Could not find product for props: ${JSON.stringify(props)}`);

    return null;
  }

  const products = await vcsDeprecated
    ["GET /api/catalog_system/pub/products/crossselling/:type/:productId"]({
      type: crossSelling,
      productId,
      ...params,
    }, { ...STALE, headers: withSegmentCookie(segment) })
    .then((res) => res.json());

  if (products && !Array.isArray(products)) {
    throw new Error(
      `Error while fetching VTEX data ${JSON.stringify(products)}`,
    );
  }

  const inStock = (p: Product) =>
    p.offers?.offers.find((o) =>
      o.availability === "https://schema.org/InStock"
    );

  if (ctx.advancedConfigs?.doNotFetchVariantsForRelatedProducts) {
    const toProducts = products.slice(0, count).map((p) =>
      toProduct(p, p.items[0], 0, {
        baseUrl: req.url,
        priceCurrency: segment?.payload?.currencyCode ?? "BRL",
      })
    );
    if (hideUnavailableItems) {
      return toProducts.filter(inStock);
    }
    return toProducts;
  }

  // unique Ids
  const relatedIds = [...new Set(
    products.slice(0, count).map((p) => pickSku(p).itemId),
  ).keys()];

  /** Batch fetches due to VTEX API limits */
  const batchedIds = batch(relatedIds, 50);

  // this new API call is necessary if you want to fetch variants
  // the related products API call does not return all variants, only one
  // use advancedConfigs?.doNotFetchVariantsForRelatedProducts to avoid this call
  const relatedProductsResults = await Promise.allSettled(
    batchedIds.map((ids) =>
      productList({ props: { similars: false, ids } }, req, ctx)
    ),
  );

  const relatedProducts = relatedProductsResults
    .filter(
      (result): result is PromiseFulfilledResult<Product[]> =>
        result.status === "fulfilled",
    )
    .flatMap((result) => result.value)
    .filter((x): x is Product => Boolean(x));

  relatedProductsResults
    .filter((result) => result.status === "rejected")
    .forEach((result, index) => {
      console.error(
        `Error loading related products for batch ${index}:`,
        (result as PromiseRejectedResult).reason,
      );
    });

  if (hideUnavailableItems && relatedProducts) {
    return relatedProducts.filter(inStock);
  }

  return relatedProducts;
}

export const cache = "stale-while-revalidate";

export const cacheKey = (props: Props, req: Request, ctx: AppContext) => {
  const url = new URL(req.url);

  if (url.searchParams.has("ft")) {
    return null;
  }

  const segment = getSegmentFromBag(ctx)?.token || "";
  const params = new URLSearchParams([
    ["slug", props.slug ?? ""],
    ["id", props.id ?? ""],
    ["crossSelling", props.crossSelling],
    ["count", (props.count ?? 0).toString()],
    ["hideUnavailableItems", (props.hideUnavailableItems ?? false).toString()],
    ["segment", segment],
  ]);

  url.searchParams.forEach((value, key) => {
    if (!isFilterParam(key)) return;
    params.append(key, value);
  });

  params.sort();

  url.search = params.toString();

  return url.href;
};

export default loader;
