import { Product, Suggestion } from "../../../commerce/types.ts";
import { AppContext } from "../../mod.ts";
import { getSegmentFromBag, withSegmentCookie } from "../../utils/segment.ts";

export interface Props {
  query?: string;
  /**
   * @description limit the number of searches
   * @default 4
   */
  count?: number;

  /**
   * @description Include similar products
   * @deprecated Use product extensions instead
   */
  similars?: boolean;
}

/**
 * @title VTEX Integration - Legacy
 */
const loaders = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> => {
  const { vcsDeprecated } = ctx;
  const { count = 4, query } = props;
  const segment = getSegmentFromBag(ctx);

  const suggestions = await vcsDeprecated["GET /buscaautocomplete"](
    {
      maxRows: count,
      productNameContains: encodeURIComponent(query ?? ""),
      suggestionsStack: "",
    },
    {
      // Not adding suggestions to cache since queries are very spread out
      // deco: { cache: "stale-while-revalidate" },
      headers: withSegmentCookie(segment),
    },
  ).then((res) => res.json());

  const searches: Suggestion["searches"] = suggestions.itemsReturned
    .filter(({ items }) => !items?.length)
    .map(({ name, href }) => ({ term: name, href }));

  const products: Suggestion["products"] = suggestions.itemsReturned
    .filter(({ items }) => !!items.length)
    .map(
      ({
        items: [{ productId, itemId, imageUrl, name, nameComplete }],
        href,
      }): Product => {
        const url = new URL(href);

        return {
          "@type": "Product",
          productID: itemId,
          sku: itemId,
          inProductGroupWithID: productId,
          isVariantOf: {
            "@type": "ProductGroup",
            name: nameComplete,
            url: new URL(href).pathname,
            hasVariant: [],
            additionalProperty: [],
            productGroupID: productId,
          },
          image: [{ "@type": "ImageObject", url: imageUrl }],
          name,
          url: url.pathname + url.search + url.hash,
        };
      },
    );

  return {
    searches,
    products,
  };
};

export default loaders;
