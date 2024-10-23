// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import type { CartFragment } from "../utils/storefront/storefront.graphql.gen.ts";
import { Context, state as storeState } from "./context.ts";

export const itemToAnalyticsItem = (
  {
    id,
    quantity,
    cost: { amountPerQuantity, compareAtAmountPerQuantity },
    merchandise,
  }: CartFragment["lines"]["nodes"][number] & { quantity: number },
  index: number,
): AnalyticsItem => ({
  item_id: id,
  quantity: quantity,
  price: amountPerQuantity.amount,
  index,
  discount: compareAtAmountPerQuantity
    ? compareAtAmountPerQuantity.amount - amountPerQuantity.amount
    : 0,
  item_name: merchandise.product.title,
  item_variant: merchandise.title,
});

const { cart, loading } = storeState;

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
  addItems: enqueue("shopify/actions/cart/addItems.ts"),
  updateItems: enqueue("shopify/actions/cart/updateItems.ts"),
  addCouponsToCart: enqueue("shopify/actions/cart/updateCoupons.ts"),
  simulate: invoke.shopify.actions.order.draftOrderCalculate,
};

export const useCart = () => state;
