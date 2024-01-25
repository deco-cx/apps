// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import { mapCategoriesToAnalyticsCategories } from "../../commerce/utils/productToAnalyticsItem.ts";
import { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import type { OrderForm, OrderFormItem } from "../utils/types.ts";
import { Context, state as storeState } from "./context.ts";

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
  affiliation: item.seller,
  item_id: item.id,
  item_group_id: item.productId,
  quantity: item.quantity,
  coupon: item.coupon ?? "",
  price: item.sellingPrice / 100,
  index,
  discount: Number(((item.listPrice - item.sellingPrice) / 100).toFixed(2)),
  item_name: item.name ?? item.skuName ?? "",
  item_variant: item.skuName,
  item_brand: item.additionalInfo.brandName ?? "",
  item_url: new URL(item.detailUrl, globalThis.window.location.href).href,
  ...(mapItemCategoriesToAnalyticsCategories(item)),
});

type EnqueuableActions<
  K extends keyof Manifest["actions"],
> = Manifest["actions"][K]["default"] extends
  (...args: any[]) => Promise<Context["cart"]> ? K : never;

const enqueue = <
  K extends keyof Manifest["actions"],
>(key: EnqueuableActions<K>) =>
(props: Parameters<Manifest["actions"][K]["default"]>[0]) =>
  storeState.enqueue((signal) =>
    invoke({ cart: { key, props } } as any, { signal }) as any
  );

const state = {
  cart,
  loading,
  updateItems: enqueue("vtex/actions/cart/updateItems.ts"),
  removeAllItems: enqueue("vtex/actions/cart/removeItems.ts"),
  addItems: enqueue("vtex/actions/cart/addItems.ts"),
  addCouponsToCart: enqueue("vtex/actions/cart/updateCoupons.ts"),
  changePrice: enqueue("vtex/actions/cart/updateItemPrice.ts"),
  getCartInstallments: invoke.vtex.actions.cart.getInstallment,
  ignoreProfileData: enqueue("vtex/actions/cart/updateProfile.ts"),
  removeAllPersonalData: enqueue("vtex/actions/cart/updateUser.ts"),
  addItemAttachment: enqueue("vtex/actions/cart/updateItemAttachment.ts"),
  removeItemAttachment: enqueue("vtex/actions/cart/removeItemAttachment.ts"),
  sendAttachment: enqueue("vtex/actions/cart/updateAttachment.ts"),
  updateGifts: enqueue("vtex/actions/cart/updateGifts.ts"),
  simulate: invoke.vtex.actions.cart.simulation,
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
