import { IS_BROWSER } from "$fresh/runtime.ts";
import { signal } from "@preact/signals";
import { invoke } from "../runtime.ts";
import type { Cart } from "../loaders/cart.ts";
import { Wishlist } from "../utils/client/types.ts";

export interface Context {
  cart: Cart;
  wishlist: Wishlist | null;
}

const loading = signal<boolean>(true);
const context = {
  cart: signal<Cart | null>(null),
  wishlist: signal<Wishlist | null>(null),
};

let queue = Promise.resolve();
let abort = () => {};
const enqueue = (
  cb: (signal: AbortSignal) => Promise<Partial<Context>> | Partial<Context>
) => {
  abort();

  loading.value = true;
  const controller = new AbortController();

  queue = queue.then(async () => {
    try {
      const { cart, wishlist } = await cb(controller.signal);

      if (controller.signal.aborted) {
        throw { name: "AbortError" };
      }

      context.cart.value = cart || context.cart.value;
      context.wishlist.value = wishlist || context.wishlist.value;

      loading.value = false;
    } catch (error) {
      if (error.name === "AbortError") return;

      if (error.name === "SyntaxError") {
        throw new Error(error);
      }

      console.error(error);
      loading.value = false;
    }
  });

  abort = () => controller.abort();

  return queue;
};

const load = (signal: AbortSignal) =>
  invoke(
    {
      cart: invoke.magento.loaders.cart(),
      wishlist: invoke.magento.loaders.wishlist(),
    },
    { signal }
  );

if (IS_BROWSER) {
  enqueue(load);

  document.addEventListener(
    "visibilitychange",
    () => document.visibilityState === "visible" && enqueue(load)
  );
}

export const state = {
  ...context,
  loading,
  enqueue,
};
