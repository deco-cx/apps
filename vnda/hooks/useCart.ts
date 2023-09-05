import type { InvocationFuncFor } from "deco/clients/withManifest.ts";
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import type { Cart, Item } from "../utils/client/types.ts";
import { state as storeState } from "./context.ts";

const { cart, loading } = storeState;

export const itemToAnalyticsItem = (
  item: Item & { quantity: number },
  index: number,
): AnalyticsItem => ({
  item_id: `${item.id}_${item.variant_sku}`,
  item_name: item.product_name,
  discount: item.price - item.variant_price,
  item_variant: item.variant_name.slice(item.product_name.length).trim(),
  // TODO: check
  price: item.price,
  // TODO
  // item_brand: "todo",
  index,
  quantity: item.quantity,
});

type PropsOf<T> = T extends (props: infer P, r: any, ctx: any) => any ? P
  : T extends (props: infer P, r: any) => any ? P
  : T extends (props: infer P) => any ? P
  : never;

type Actions =
  | "vnda/actions/cart/addItem.ts"
  | "vnda/actions/cart/updateCart.ts"
  | "vnda/actions/cart/updateItem.ts";

const action =
  (key: Actions) => (props: PropsOf<InvocationFuncFor<Manifest, typeof key>>) =>
    storeState.enqueue((signal) =>
      invoke({ cart: { key, props } }, { signal }) satisfies Promise<
        { cart: Cart }
      >
    );

const state = {
  cart,
  loading,
  update: action("vnda/actions/cart/updateCart.ts"),
  addItem: action("vnda/actions/cart/addItem.ts"),
  updateItem: action("vnda/actions/cart/updateItem.ts"),
};

export const useCart = () => state;
