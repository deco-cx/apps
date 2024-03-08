// deno-lint-ignore-file no-explicit-any
import type { AnalyticsItem } from "../../commerce/types.ts";
import type { Manifest } from "../manifest.gen.ts";
import { invoke } from "../runtime.ts";
import { Context, state as storeState } from "./context.ts";

const { cart, loading } = storeState;

export const itemToAnalyticsItem = (
  item: any,
  index: number,
): AnalyticsItem => {
  return {
    item_id: item.hash.idProduto,
    quantity: item.quantidade,
    price: item.price,
    index,
    discount: item.precos.precoDe - item.precos.precoPor,
    item_name: item.nome!,
    item_variant: item.hash.idProduto,
  };
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
  addItems: enqueue("wap/actions/cart/addItems.ts"),
  updateItem: enqueue("wap/actions/cart/updateItem.ts"),
  removeItem: enqueue("wap/actions/cart/removeItem.ts"),
  updateCoupon: invoke.wap.actions.cart.updateCoupon,
};

export const useCart = () => state;
