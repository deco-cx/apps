import { Product, Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import {
  getSegment,
  setSegment,
  withSegmentCookie,
} from "../../utils/segment.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;

  /**
   * @description Include similar products
   */
  similars?: boolean;
}

/**
 * @title VTEX Integration - Legacy
 */
const loaders = async (
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { vcs } = ctx;
  const { count = 4, query } = props;
  const segment = getSegment(req);

  const response = await vcs["GET /buscaautocomplete"]({
    maxRows: count,
    productNameContains: query,
    suggestionsStack: "",
  }, {
    // Not adding suggestions to cache since queries are very spread out
    // deco: { cache: "stale-while-revalidate" },
    headers: withSegmentCookie(segment),
  });

  const suggestions = await response.json();

  if (!suggestions?.itemsReturned) return null;

  setSegment(segment, ctx.response.headers);

  const suggestedTerms = suggestions.itemsReturned.filter(({ items }) =>
    !items?.length
  ).map(({ name, href }) => ({ term: name, href }));

  const products = suggestions.itemsReturned.filter(({ items }) =>
    !!items.length
  ).map(({ items, href, thumbUrl }) => {
    const { nameComplete, name, productId, itemId } = items[0];
    const thumbUrlWithoutResize = thumbUrl?.replace("-25-25", "");
    // This is being used only in autocomplete. Unfortunately there's no more info.
    const partialProduct: Product = {
      "@type": "Product",
      productID: productId,
      sku: itemId,
      isVariantOf: {
        "@type": "ProductGroup",
        name: nameComplete,
        url: (new URL(href)).pathname,
        hasVariant: [],
        additionalProperty: [],
        productGroupID: productId,
      },
      name,
      image: thumbUrl
        ? [{
          "@type": "ImageObject",
          url: thumbUrlWithoutResize,
          alternateName: nameComplete,
        }]
        : [],
      url: `${(new URL(href)).pathname}?skuId=${itemId}`,
    };

    return partialProduct;
  });

  return {
    searches: suggestedTerms,
    products,
  };
};

export default loaders;
