import { Product, Suggestion } from "../../../commerce/types.ts";
// See commments below
// import { fetchAPI } from "../../../utils/fetch.ts";
// import {
//   getSegment,
//   setSegment,
//   withSegmentCookie,
// } from "../../utils/segment.ts";
import { AppContext } from "../../mod.ts";
import { paths } from "../../utils/paths.ts";
import type { PortalSuggestion } from "../../utils/types.ts";

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
 * @title VTEX Integration - Intelligent Search
 * @description Product Suggestion loader
 */
const loaders = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { count = 4, query } = props;
  const search = paths(ctx).api.catalog_system.pub.portal.buscaautocomplete();

  const qs = new URLSearchParams();
  qs.set("maxRows", `${count}`);
  qs.set("productNameContains", `${query}`);
  qs.set("suggestionsStack", "");

  /**
   * TODO: Understand why I was getting "Body already consumed" with this/
   *
   * Couldn't use ctx.response.headers as well, so I removed all segment logic
   */
  // const suggestions = await fetchAPI<PortalSuggestion>(
  //   `${search}?${qs}`,
  //   {
  //     deco: { cache: "stale-while-revalidate" },
  //     headers: withSegmentCookie(segment),
  //   },
  // );

  const suggestionsReq = await fetch(
    `${search}?${qs}`,
  );

  const suggestions = (await suggestionsReq.json()) as PortalSuggestion;

  if (!suggestions?.itemsReturned) return null;

  // setSegment(segment, ctx.response.headers);

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
      //
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
