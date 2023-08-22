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
    Runtime.create("shopify/actions/cart/addItems.ts"),
  ),
  updateItems: wrap(
    Runtime.create("shopify/actions/cart/updateItems.ts"),
  ),
  addCouponsToCart: wrap(
    Runtime.create("shopify/actions/cart/updateCoupons.ts"),
  ),
};

export const useCart = () => state;
