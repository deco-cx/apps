import type { AnalyticsItem } from "../../commerce/types.ts";
import { mapCategoriesToAnalyticsCategories } from "../../commerce/utils/productToAnalyticsItem.ts";
import { invoke } from "../runtime.ts";
import type { OrderForm, OrderFormItem } from "../utils/types.ts";
import { state as storeState } from "./context.ts";

const { cart, loading } = storeState;

const mapItemCategoriesToAnalyticsCategories = (
  item: OrderFormItem,
): Record<`item_category${number | ""}`, string> => {
  return mapCategoriesToAnalyticsCategories(
    Object.values(item.productCategories),
  );
};

const mapOrderFormItemsToAnalyticsItems = (
  orderForm: Pick<OrderForm, "items" | "marketingData">,
): AnalyticsItem[] => {
  const items = orderForm.items;

  if (!items) {
    return [];
  }

  const coupon = orderForm.marketingData?.coupon ?? undefined;

  return items.map((item, index) => ({
    item_id: item.productId,
    item_name: item.name ?? item.skuName ?? "",
    coupon,
    discount: Number(((item.price - item.sellingPrice) / 100).toFixed(2)),
    index,
    item_brand: item.additionalInfo.brandName ?? "",
    item_variant: item.skuName,
    price: item.price / 100,
    quantity: item.quantity,
    affiliation: item.seller,
    ...(mapItemCategoriesToAnalyticsCategories(item)),
  }));
};

export const itemToAnalyticsItem = (
  item: OrderForm["items"][number] & { coupon?: string },
  index: number,
) => ({
  item_id: item.productId,
  item_name: item.name ?? item.skuName ?? "",
  coupon: item.coupon,
  discount: Number(((item.price - item.sellingPrice) / 100).toFixed(2)),
  index,
  item_brand: item.additionalInfo.brandName ?? "",
  item_variant: item.skuName,
  price: item.price / 100,
  quantity: item.quantity,
  affiliation: item.seller,
  ...(mapItemCategoriesToAnalyticsCategories(item)),
});

const wrap =
  <T>(action: (p: T, init?: RequestInit | undefined) => Promise<OrderForm>) =>
  (p: T) =>
    storeState.enqueue(async (signal) => ({
      cart: await action(p, { signal }),
    }));

const state = {
  cart,
  loading,
  updateItems: wrap(
    invoke.vtex.actions.cart.updateItems,
  ),
  removeAllItems: wrap(
    invoke.vtex.actions.cart.removeItems,
  ),
  addItems: wrap(
    invoke.vtex.actions.cart.addItems,
  ),
  addCouponsToCart: wrap(
    invoke.vtex.actions.cart.updateCoupons,
  ),
  changePrice: wrap(
    invoke.vtex.actions.cart.updateItemPrice,
  ),
  getCartInstallments: wrap(
    invoke.vtex.actions.cart.getInstallment,
  ),
  ignoreProfileData: wrap(
    invoke.vtex.actions.cart.updateProfile,
  ),
  removeAllPersonalData: wrap(
    invoke.vtex.actions.cart.updateUser,
  ),
  addItemAttachment: wrap(
    invoke.vtex.actions.cart.updateItemAttachment,
  ),
  removeItemAttachment: wrap(
    invoke.vtex.actions.cart.removeItemAttachment,
  ),
  sendAttachment: wrap(
    invoke.vtex.actions.cart.updateAttachment,
  ),
  simulate: invoke.vtex.actions.cart.simulation,
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
