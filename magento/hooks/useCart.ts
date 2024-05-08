// deno-lint-ignore-file no-explicit-any
import { Manifest } from "../manifest.gen.ts";
import { Context, state as storeState } from "../hooks/context.ts";
import { invoke } from "../runtime.ts";

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
  addItem: enqueue("magento/actions/cart/addItem.ts"),
  updateItem: enqueue("magento/actions/cart/updateItem.ts"),
  simulate: invoke.magento.actions.cart.simulation,
};

export const useCart = () => state;
