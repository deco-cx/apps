import { InvocationFuncFor } from "deco/clients/withManifest.ts";
import type { AnalyticsItem } from "../../commerce/types.ts";
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Fragment as Cart, Item } from "../utils/fragments/cart.ts";
import { state as storeState } from "./context.ts";

export const itemToAnalyticsItem = (
  item: Item & { quantity: number },
  index: number,
): AnalyticsItem => ({
  item_id: item.id,
  item_name: item.merchandise.product.title,
  discount: item.cost.compareAtAmountPerQuantity
    ? item.cost.compareAtAmountPerQuantity.amount -
      item.cost.amountPerQuantity?.amount
    : 0,
  item_variant: item.merchandise.title,
  price: item.cost.amountPerQuantity.amount,
  index,
  quantity: item.quantity,
});

const { cart, loading } = storeState;

type PropsOf<T> = T extends (props: infer P, r: any, ctx: any) => any ? P
  : T extends (props: infer P, r: any) => any ? P
  : T extends (props: infer P) => any ? P
  : never;

type Actions =
  | "shopify/actions/cart/addItems.ts"
  | "shopify/actions/cart/updateItems.ts"
  | "shopify/actions/cart/updateCoupons.ts";

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
  addItems: action("shopify/actions/cart/addItems.ts"),
  updateItems: action("shopify/actions/cart/updateItems.ts"),
  addCouponsToCart: action("shopify/actions/cart/updateCoupons.ts"),
};

export const useCart = () => state;
