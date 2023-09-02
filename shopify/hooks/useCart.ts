import type { AnalyticsItem } from "../../commerce/types.ts";
import { Runtime } from "../runtime.ts";
import { Cart, Item } from "../utils/types.ts";
import { state as storeState } from "./context.ts";

export const itemToAnalyticsItem = (
  item: Item & { quantity: number },
  index: number,
): AnalyticsItem => ({
  item_id: item.id,
  item_name: item.merchandise.product.title,
  discount: item.cost.compareAtAmountPerQuantity ? item.cost.compareAtAmountPerQuantity.amount - item.cost.amountPerQuantity?.amount : 0,
  item_variant: item.merchandise.title,
  price: item.cost.amountPerQuantity.amount,
  index,
  quantity: item.quantity,
});

const { cart, loading } = storeState;

const wrap =
  <T>(action: (p: T, init?: RequestInit | undefined) => Promise<Cart>) =>
  (p: T) =>
    storeState.enqueue(async (signal) => ({
      cart: await action(p, { signal }),
    }));

const state = {
  cart,
  loading,
  addItems: wrap(
    Runtime.shopify.actions.cart.addItems,
  ),
  updateItems: wrap(
    Runtime.shopify.actions.cart.updateItems,
  ),
  addCouponsToCart: wrap(
    Runtime.shopify.actions.cart.updateCoupons,
  ),
};

export const useCart = () => state;
