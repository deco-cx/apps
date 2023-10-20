import { AppContext } from "../mod.ts";
import { QUERY_KIT_ITEMS } from "./graphql/kitItems.ts";
import { Product } from "./types.ts";

export const getKitItems = async (sku: string, ctx: AppContext) => {
  const { io } = ctx;

  try {
    const data: { product: Product } = await io.query(
      {
        query: QUERY_KIT_ITEMS,
        variables: {
          identifier: { field: "sku", value: sku },
        },
      },
    );

    return data.product.items[0].kitItems ?? [];
  } catch (_error) {
    console.error("Error fetching kitItems");
    return null;
  }
};