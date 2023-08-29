import { Runtime } from "../runtime.ts";
import { Cart } from "../utils/types.ts";
import { state as storeState } from "./context.ts";

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
