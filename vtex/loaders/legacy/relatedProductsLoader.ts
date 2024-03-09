import type { Product } from "../../../commerce/types.ts";
import { STALE } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { batch } from "../../utils/batch.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";
import { pickSku } from "../../utils/transform.ts";
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
 * @title VTEX Integration - Related Products
 * @description Related Products loader
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

  // unique Ids
  const relatedIds = [...new Set(
    products.slice(0, count).map((p) => pickSku(p).itemId),
  ).keys()];

  /** Batch fetches due to VTEX API limits */
  const batchedIds = batch(relatedIds, 50);
  const relatedProducts = await Promise.all(
    batchedIds.map((ids) =>
      productList({ props: { similars: false, ids } }, req, ctx)
    ),
  ).then((p) => p.flat().filter((x): x is Product => Boolean(x)));

  // Search API does not offer a way to filter out in stock products
  // This is a scape hatch
  if (hideUnavailableItems && relatedProducts) {
    const inStock = (p: Product) =>
      p.offers?.offers.find((o) =>
        o.availability === "https://schema.org/InStock"
      );

    return relatedProducts.filter(inStock);
  }

  return relatedProducts;
}

export { cache, cacheKey } from "../../utils/cacheBySegment.ts";

export default loader;
