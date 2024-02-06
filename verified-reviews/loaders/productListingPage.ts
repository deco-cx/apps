import { AppContext } from "../mod.ts";
import { ProductListingPage } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import {
  createClient,
  getProductId,
  PaginationOptions,
} from "../utils/client.ts";
import { getRatingProduct } from "../utils/transform.ts";

export type Props = PaginationOptions;

/**
 * @title Opiniões verificadas - Full Review for Product (Ratings and Reviews)
 */
export default function productListingPage(
  _config: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<ProductListingPage | null> {
  const client = createClient({ ...ctx });
  return async (page: ProductListingPage | null) => {
    if (!page) {
      return null;
    }
    if (!client) {
      return page;
    }

    const productsIds = page.products.map(getProductId);
    const ratings = await client.ratings({ productsIds: productsIds });

    return {
      ...page,
      products: page.products.map((product) => {
        const productId = getProductId(product);
        return {
          ...product,
          aggregateRating: getRatingProduct({
            ratings,
            productId: productId,
          }),
        };
      }),
    };
  };
}
