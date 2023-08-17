import { paths } from "apps/vtex/utils/paths.ts";
import { pickSku, toProduct } from "apps/vtex/utils/transform.ts";
import { RequestURLParam } from "apps/website/functions/requestToParam.ts";
import { getSegment, setSegment } from "apps/vtex/utils/segment.ts";
import { toSegmentParams } from "apps/vtex/utils/legacy.ts";
import type { Product } from "apps/commerce/types.ts";
import type { CrossSellingType } from "apps/vtex/utils/types.ts";
import type { LegacyProduct, PageType } from "apps/vtex/utils/types.ts";
import { AppContext } from "apps/vtex/mod.ts";
import { withSegmentCookie } from "apps/vtex/utils/segment.ts";
import { fetchAPI } from "apps/utils/fetch.ts";

export interface Props {
  /**
   * @title Related Products
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
 * @title VTEX Integration - Legacy Search
 * @description Related Products loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
  const { url } = req;
  const {
    hideUnavailableItems,
    crossSelling = "similars",
    count,
  } = props;
  const api = paths(ctx).api.catalog_system.pub;
  const segment = getSegment(req);
  const params = toSegmentParams(segment);

  const getProductGroupID = async (props: { slug?: string; id?: string }) => {
    const { id, slug } = props;

    if (id) {
      return id;
    }

    if (slug) {
      const pageType = await fetchAPI<PageType>(
        api.portal.pagetype.term(`${slug}/p`),
        { withProxyCache: true },
      );

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

  const vtexRelatedProducts = await fetchAPI<LegacyProduct[]>(
    `${
      api.products.crossselling.type(crossSelling).productId(productId)
    }?${params}`,
    { withProxyCache: true, headers: withSegmentCookie(segment) },
  );

  const options = {
    baseUrl: url,
    priceCurrency: "BRL", // config!.defaultPriceCurrency, // TODO
  };

  const relatedProducts = vtexRelatedProducts
    .slice(0, count ?? Infinity)
    .map((p) => toProduct(p, pickSku(p), 0, options));

  setSegment(segment, ctx.response.headers);

  // Search API does not offer a way to filter out in stock products
  // This is a scape hatch
  if (hideUnavailableItems) {
    const inStock = (p: Product) =>
      p.offers?.offers.find((o) =>
        o.availability === "https://schema.org/InStock"
      );

    return relatedProducts.filter(inStock);
  }

  return relatedProducts;
}

export default loader;
