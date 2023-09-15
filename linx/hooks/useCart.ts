// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { cart, loading } = storeState;

export const itemToAnalyticsItem = (
  _item: unknown & { quantity: number },
  _index: number,
): AnalyticsItem => {
  console.log("TODO");

  return {} as any;

  // return ({
  //   item_id: `${item.id}_${item.variant_sku}`,
  //   item_name: item.product_name,
  //   discount: item.price - item.variant_price,
  //   item_variant: item.variant_name.slice(item.product_name.length).trim(),
  //   // TODO: check
  //   price: item.price,
  //   // TODO
  //   // item_brand: "todo",
  //   index,
  //   quantity: item.quantity,
  // });
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
  update: enqueue("linx/actions/cart/updateCart.ts"),
  addItem: enqueue("linx/actions/cart/addItem.ts"),
  updateItem: enqueue("linx/actions/cart/updateItem.ts"),
};

export const useCart = () => state;
