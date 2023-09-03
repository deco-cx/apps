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
  | "vtex/actions/cart/updateItems.ts"
  | "vtex/actions/cart/removeItems.ts"
  | "vtex/actions/cart/addItems.ts"
  | "vtex/actions/cart/updateCoupons.ts"
  | "vtex/actions/cart/updateItemPrice.ts"
  | "vtex/actions/cart/getInstallment.ts"
  | "vtex/actions/cart/updateProfile.ts"
  | "vtex/actions/cart/updateUser.ts"
  | "vtex/actions/cart/updateItemAttachment.ts"
  | "vtex/actions/cart/removeItemAttachment.ts"
  | "vtex/actions/cart/updateAttachment.ts";

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
  updateItems: action("vtex/actions/cart/updateItems.ts"),
  removeAllItems: action("vtex/actions/cart/removeItems.ts"),
  addItems: action("vtex/actions/cart/addItems.ts"),
  addCouponsToCart: action("vtex/actions/cart/updateCoupons.ts"),
  changePrice: action("vtex/actions/cart/updateItemPrice.ts"),
  getCartInstallments: action("vtex/actions/cart/getInstallment.ts"),
  ignoreProfileData: action("vtex/actions/cart/updateProfile.ts"),
  removeAllPersonalData: action("vtex/actions/cart/updateUser.ts"),
  addItemAttachment: action("vtex/actions/cart/updateItemAttachment.ts"),
  removeItemAttachment: action("vtex/actions/cart/removeItemAttachment.ts"),
  sendAttachment: action("vtex/actions/cart/updateAttachment.ts"),
  simulate: invoke.vtex.actions.cart.simulation,
  mapItemsToAnalyticsItems: mapOrderFormItemsToAnalyticsItems,
};

export const useCart = () => state;
