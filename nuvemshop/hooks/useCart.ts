// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { ProductElement } from "../utils/types.ts";
import { Context, state as storeState } from "./context.ts";

export const itemToAnalyticsItem = (
  item: ProductElement,
  index: number,
): AnalyticsItem => ({
  item_id: item.sku,
  item_group_id: item.product_id.toString(),
  quantity: item.quantity,
  price: Number(item.price),
  discount: item.compare_at_price
    ? Number(item.compare_at_price) -
      Number(item.price)
    : 0,
  item_name: item.name,
  item_variant: item.name,
  index,
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
  addItems: enqueue("nuvemshop/actions/cart/addItems.ts"),
  updateItems: enqueue("nuvemshop/actions/cart/updateItems.ts"),
};

export const useCart = () => state;
