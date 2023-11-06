// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { cart, loading } = storeState;

type Item = NonNullable<NonNullable<Context["cart"]>["Basket"]>;

export const itemToAnalyticsItem = (
  item: NonNullable<Item>["Items"][number],
  coupon: string | undefined,
  index: number,
): AnalyticsItem => {
  return ({
    item_id: `${item.BasketItemID}`,
    item_name: item.Name,
    coupon,
    discount: item.ListPrice - item.RetailPrice,
    index,
    item_brand: item.BrandName,
    item_variant: item.SkuName,
    price: item.RetailPrice,
    quantity: item.Quantity,
    affiliation: item.Seller.SellerName ?? undefined,
  });
};

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
  addItem: enqueue("linx/actions/cart/addItem.ts"),
  updateItem: enqueue("linx/actions/cart/updateItem.ts"),
  addCoupon: enqueue("linx/actions/cart/addCoupon.ts"),
};

export const useCart = () => state;
