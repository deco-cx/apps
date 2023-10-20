import { AppContext } from "../mod.ts";
import { QUERY_KIT_ITEMS } from "./graphql/kitItems.ts";
import { Item, KitItem } from "./types.ts";

export const getKitItems = async (sku: string, ctx: AppContext) => {
  const { io } = ctx;

  try {
    const data = await io.query<
      {
        product: {
          items: Array<
            Omit<Item, "kitItems"> & {
              kitItems: Array<KitItem & { sku: Item }>;
            }
          >;
        };
      },
      {
        identifier: { field: string; value: string };
      }
    >(
      {
        query: QUERY_KIT_ITEMS,
        variables: {
          identifier: { field: "sku", value: sku },
        },
      },
    );

    return data.product.items[0].kitItems;
  } catch (_error) {
    console.error("Error fetching kitItems");
    return [];
  }
};
