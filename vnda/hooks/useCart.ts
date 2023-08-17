import { AnalyticsItem } from "apps/commerce/types.ts";
import { Runtime } from "apps/vnda/runtime.ts";
import { Cart, Item } from "apps/vnda/utils/client/types.ts";
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

const wrap =
  <T>(action: (p: T, init?: RequestInit | undefined) => Promise<Cart>) =>
  (p: T) =>
    storeState.enqueue(async (signal) => ({
      cart: await action(p, { signal }),
    }));

const state = {
  cart,
  loading,
  addItem: wrap(
    Runtime.create("apps/vnda/actions/cart/addItem.ts"),
  ),
  updateItem: wrap(
    Runtime.create("apps/vnda/actions/cart/updateItem.ts"),
  ),
  setShippingAddress: wrap(
    Runtime.create("apps/vnda/actions/cart/setShippingAddress.ts"),
  ),
  updateCoupon: wrap(
    Runtime.create("apps/vnda/actions/cart/updateCoupon.ts"),
  ),
};

export const useCart = () => state;
