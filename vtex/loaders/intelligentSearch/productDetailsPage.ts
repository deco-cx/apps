import type { ProductDetailsPage } from "../../../commerce/types.ts";
import type { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import {
  toPath,
  withDefaultFacets,
  withDefaultParams,
} from "../../utils/intelligentSearch.ts";
import { pageTypesToSeo } from "../../utils/legacy.ts";
import { SEGMENT, withSegmentCookie } from "../../utils/segment.ts";
import { withIsSimilarTo } from "../../utils/similars.ts";
import { pickSku, toProductPage } from "../../utils/transform.ts";
import type { PageType, Product as VTEXProduct } from "../../utils/types.ts";

export interface Props {
  slug: RequestURLParam;
  /**
   * @description Include similar products
   */
  similars?: boolean;
}

/**
 * When there's no ?skuId querystring, we need to figure out the product id
 * from the pathname. For this, we use the pageType api
 */
const getProductID = (page: PageType) => {
  if (page.pageType !== "Product") {
    return null;
  }

  return page.id!;
};

/**
 * @title VTEX Integration - Intelligent Search
 * @description Product Details Page loader
 */
const loader = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<ProductDetailsPage | null> => {
  const { vcs } = ctx;
  const { url: baseUrl } = req;
  const { slug } = props;
  const segment = ctx.bag.get(SEGMENT);

  const pageTypePromise = vcs
    ["GET /api/catalog_system/pub/portal/pagetype/:term"]({
      term: `${slug}/p`,
    }, { deco: { cache: "stale-while-revalidate" } }).then((res) => res.json());

  const url = new URL(baseUrl);
  const skuId = url.searchParams.get("skuId");
  const productId = !skuId && getProductID(await pageTypePromise);

  /**
   * Fetch the exact skuId. If no one was provided, try fetching the product
   * and return the first sku
   */
  const query = skuId
    ? `sku:${skuId}`
    : productId
    ? `product:${productId}`
    : null;

  // In case we dont have the skuId or the productId, 404
  if (!query) {
    return null;
  }

  const facets = withDefaultFacets([], ctx);
  const params = withDefaultParams({ query, count: 1 });

  const { products: [product] } = await vcs
    ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
      ...params,
      facets: toPath(facets),
    }, {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    }).then((res) => res.json());

  // Product not found, return the 404 status code
  if (!product) {
    return null;
  }

  const sku = pickSku(product, skuId?.toString());

  let kitItems: VTEXProduct[] = [];
  if (sku.isKit && sku.kitItems) {
    const params = withDefaultParams({
      query: `sku:${sku.kitItems.join(";")}`,
      count: sku.kitItems.length,
    });

    const result = await vcs
      ["GET /api/io/_v/api/intelligent-search/product_search/*facets"]({
        ...params,
        facets: toPath(facets),
      }, {
        deco: { cache: "stale-while-revalidate" },
        headers: withSegmentCookie(segment),
      }).then((res) => res.json());

    kitItems = result.products;
  }

  const pageType = await pageTypePromise;

  const page = toProductPage(product, sku, kitItems, {
    baseUrl,
    priceCurrency: "BRL", // config!.defaultPriceCurrency, TODO: fix currency
  });

  return {
    ...page,
    product: props.similars
      ? await withIsSimilarTo(req, ctx, page.product)
      : page.product,
    seo: pageType.pageType === "Product"
      ? pageTypesToSeo([pageType], req)
      : null,
  };
};

export default loader;
