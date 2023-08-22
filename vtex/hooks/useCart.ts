import type { AnalyticsItem } from "../../commerce/types.ts";
import { mapCategoriesToAnalyticsCategories } from "../../commerce/utils/productToAnalyticsItem.ts";
import { Runtime } from "../runtime.ts";
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
    Runtime.create("vtex/actions/cart/updateItems.ts"),
  ),
  removeAllItems: wrap(
    Runtime.create("vtex/actions/cart/removeItems.ts"),
  ),
  addItems: wrap(
    Runtime.create("vtex/actions/cart/addItems.ts"),
  ),
  addCouponsToCart: wrap(
    Runtime.create("vtex/actions/cart/updateCoupons.ts"),
  ),
  changePrice: wrap(
    Runtime.create("vtex/actions/cart/updateItemPrice.ts"),
  ),
  getCartInstallments: wrap(
    Runtime.create("vtex/actions/cart/getInstallment.ts"),
  ),
  ignoreProfileData: wrap(
    Runtime.create("vtex/actions/cart/updateProfile.ts"),
  ),
  removeAllPersonalData: wrap(
    Runtime.create("vtex/actions/cart/updateUser.ts"),
  ),
  addItemAttachment: wrap(
    Runtime.create("vtex/actions/cart/updateItemAttachment.ts"),
  ),
  removeItemAttachment: wrap(
    Runtime.create("vtex/actions/cart/removeItemAttachment.ts"),
  ),
  sendAttachment: wrap(
    Runtime.create("vtex/actions/cart/updateAttachment.ts"),
  ),
  simulate: Runtime.create("vtex/actions/cart/simulation.ts"),
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
