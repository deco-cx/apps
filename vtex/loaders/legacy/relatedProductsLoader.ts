import type { Product } from "../../../commerce/types.ts";
import { fetchAPI } from "../../../utils/fetch.ts";
import { RequestURLParam } from "../../../website/functions/requestToParam.ts";
import { AppContext } from "../../mod.ts";
import { toSegmentParams } from "../../utils/legacy.ts";
import { paths } from "../../utils/paths.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "../../utils/segment.ts";
import { pickSku } from "../../utils/transform.ts";
import type {
  CrossSellingType,
  LegacyProduct,
  PageType,
} from "../../utils/types.ts";
import productList from "./productList.ts";

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
 * @title VTEX Integration - Related Products
 * @description Related Products loader
 */
async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Product[] | null> {
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
        { deco: { cache: "stale-while-revalidate" } },
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

  const relatedIds = await fetchAPI<LegacyProduct[]>(
    `${
      api.products.crossselling.type(crossSelling).productId(productId)
    }?${params}`,
    {
      deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    },
  ).then((products = []) =>
    products
      .slice(0, count ?? Infinity)
      .map((p) => pickSku(p).itemId)
  );

  const relatedProducts = await productList(
    {
      similars: false,
      ids: relatedIds,
    },
    req,
    ctx,
  );

  setSegment(segment, ctx.response.headers);

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

export default loader;
