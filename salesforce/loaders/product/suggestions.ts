// deno-lint-ignore-file
import { AppContext } from "../../mod.ts";
import type { Suggestion } from "../../../commerce/types.ts";
import {
  toProductSuggestions,
  toSearchSuggestions,
} from "../../utils/transform.ts";
import { getSession } from "../../utils/session.ts";
import { getImages } from "../../utils/product.ts";
import { ProductSearch } from "../../utils/types.ts";

/**
 * @title Salesforce - suggestions
 */
export interface Props {
  /**
   * @title Query
   * @description Keyphase of the collection.
   */
  query?: string;

  /**
   * @description Maximum records to retrieve per request, not to exceed 50. Defaults to 25.
   * @default 10
   * @max 50
   */
  limit: number;

  allImages: boolean;
}

/**
 * @title Salesforce - suggestions
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext,
): Promise<Suggestion | null> {
  const { slc, organizationId, siteId } = ctx;

  const session = getSession(ctx);

  const url = new URL(req.url);
  const { limit, allImages } = props;
  const query = props.query ?? url.searchParams.get("query") ?? "";
  const response = await slc
    ["GET /search/shopper-search/v1/organizations/:organizationId/search-suggestions"](
      {
        organizationId,
        siteId: siteId,
        q: query,
        limit: limit,
      },
      {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      },
    );

  const suggestions = await response.json();
  let productImages: any;
  if (allImages) {
    const productsIdsSuggestions: string[] = suggestions.productSuggestions
      ?.products.map(
        (item: { productId: string }) => {
          return item.productId;
        },
      );

    productImages = await getImages(productsIdsSuggestions, ctx);
  }

  const products = toProductSuggestions(
    suggestions.productSuggestions,
    url.origin,
    productImages,
  );
  const searches = toSearchSuggestions(
    suggestions.searchPhrase,
    suggestions.productSuggestions,
    products.length,
  );

  return { searches, products };
}
