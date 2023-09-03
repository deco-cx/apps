import { InvocationFuncFor } from "deco/clients/withManifest.ts";
import type { AnalyticsItem } from "../../commerce/types.ts";
import { mapCategoriesToAnalyticsCategories } from "../../commerce/utils/productToAnalyticsItem.ts";
import { Manifest } from "../manifest.gen.ts";
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

type PropsOf<T> = T extends (props: infer P, r: any, ctx: any) => any ? P
  : T extends (props: infer P, r: any) => any ? P
  : T extends (props: infer P) => any ? P
  : never;

type Actions =
  | "vtex/actions/cart/updateItems"
  | "vtex/actions/cart/removeItems"
  | "vtex/actions/cart/addItems"
  | "vtex/actions/cart/updateCoupons"
  | "vtex/actions/cart/updateItemPrice"
  | "vtex/actions/cart/getInstallment"
  | "vtex/actions/cart/updateProfile"
  | "vtex/actions/cart/updateUser"
  | "vtex/actions/cart/updateItemAttachment"
  | "vtex/actions/cart/removeItemAttachment"
  | "vtex/actions/cart/updateAttachment";

const action =
  (key: Actions) => (props: PropsOf<InvocationFuncFor<Manifest, typeof key>>) =>
    storeState.enqueue((signal) =>
      invoke({ cart: { key, props } }, { signal }) satisfies Promise<
        { cart: OrderForm }
      >
    );

const state = {
  cart,
  loading,
  updateItems: action("vtex/actions/cart/updateItems"),
  removeAllItems: action("vtex/actions/cart/removeItems"),
  addItems: action("vtex/actions/cart/addItems"),
  addCouponsToCart: action("vtex/actions/cart/updateCoupons"),
  changePrice: action("vtex/actions/cart/updateItemPrice"),
  getCartInstallments: action("vtex/actions/cart/getInstallment"),
  ignoreProfileData: action("vtex/actions/cart/updateProfile"),
  removeAllPersonalData: action("vtex/actions/cart/updateUser"),
  addItemAttachment: action("vtex/actions/cart/updateItemAttachment"),
  removeItemAttachment: action("vtex/actions/cart/removeItemAttachment"),
  sendAttachment: action("vtex/actions/cart/updateAttachment"),
  simulate: invoke.vtex.actions.cart.simulation,
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
