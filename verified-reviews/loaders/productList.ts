import { AppContext } from "../mod.ts";
import { Product } from "../../commerce/types.ts";
import { ExtensionOf } from "../../website/loaders/extension.ts";
import { getRatingProduct } from "../utils/transform.ts";
import { createClient, getProductId } from "../utils/client.ts";

/**
 * @title Opiniões verificadas - Ratings for Products[]
 */
export default function productList(
  _config: unknown,
  _req: Request,
  ctx: AppContext,
): ExtensionOf<Product[] | null> {
  const client = createClient({ ...ctx });

  return async (products: Product[] | null) => {
    if (!products) {
      return null;
    }
    if (!client) {
      return products;
    }

    const productsIds = products.map(getProductId);
    const ratings = await client.ratings({ productsIds: productsIds });

    return products.map((product) => {
      const productId = getProductId(product);
      return {
        ...product,
        aggregateRating: getRatingProduct({
          ratings,
          productId: productId,
        }),
      };
    });
  };
}
